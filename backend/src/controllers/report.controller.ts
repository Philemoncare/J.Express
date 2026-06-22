import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatCurrency, getExchangeRate } from '../utils/currency';
import * as NotificationService from '../services/notification.service';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'josephotoo774@gmail.com').toLowerCase();

/**
 * AI CORE CONFIGURATION
 * Targets stable v1 endpoint to ensure connection reliability.
 */
const getAIModel = (systemInstruction?: string) => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey || apiKey.length < 10) return null;

    console.log(`[AI] Initializing Neural Link (v1 stable)...`);
    const genAI = new GoogleGenerativeAI(apiKey);

    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        ...(systemInstruction ? { systemInstruction } : {})
    }, { apiVersion: "v1" });
};

/**
 * TELEMETRY HELPERS
 */
const getTimeframeRange = (timeframe: string) => {
    const now = new Date();
    const start = new Date();
    switch (timeframe) {
        case 'daily': start.setHours(0, 0, 0, 0); break;
        case 'weekly': start.setDate(now.getDate() - 7); break;
        case 'monthly': start.setDate(now.getDate() - 30); break;
        case 'yearly': start.setFullYear(now.getFullYear() - 1); break;
        default: return null;
    }
    return { gte: start };
};

const getDataDaysCount = async () => {
    try {
        const [firstI, firstE, firstF] = await Promise.all([
            prisma.income.findFirst({ orderBy: { date: 'asc' } }),
            prisma.expense.findFirst({ orderBy: { date: 'asc' } }),
            prisma.fuelPurchase.findFirst({ orderBy: { date: 'asc' } })
        ]);
        const dates = [firstI?.date, firstE?.date, firstF?.date].filter(Boolean) as Date[];
        if (dates.length === 0) return 0;

        const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
        const now = new Date();
        // Use absolute difference to handle future-dated dummy data gracefully
        const diffDays = Math.ceil(Math.abs(now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    } catch (e) {
        return 0;
    }
};

/**
 * MAIN CONTROLLERS
 */

export const getSummary = async (req: Request, res: Response) => {
    try {
        const timeframe = (req.query.timeframe as string) || 'all';
        const userCurrency = (req.query.currency as string) || 'GHS';
        const dateRange = timeframe !== 'all' ? getTimeframeRange(timeframe) : undefined;
        const where = dateRange ? { date: dateRange } : {};

        // Optimize: Fetch everything in parallel, including the exchange rate and telemetry
        const [financials, vehicleStats, recentLogs, rate, dataDays] = await Promise.all([
            Promise.all([
                prisma.income.aggregate({ where, _sum: { amount: true } }),
                prisma.expense.aggregate({ where, _sum: { amount: true } }),
                prisma.fuelPurchase.aggregate({ where, _sum: { totalCost: true } })
            ]),
            Promise.all([
                prisma.vehicle.count({ where: { deletedAt: null } }),
                prisma.vehicle.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } })
            ]),
            Promise.all([
                prisma.income.findMany({ where, take: 5, orderBy: { date: 'desc' }, select: { id: true, date: true, source: true, amount: true, vehicle: { select: { plateNumber: true } } } }),
                prisma.expense.findMany({ where, take: 5, orderBy: { date: 'desc' }, select: { id: true, date: true, category: true, amount: true, vehicle: { select: { plateNumber: true } } } }),
                prisma.fuelPurchase.findMany({ where, take: 5, orderBy: { date: 'desc' }, select: { id: true, date: true, stationName: true, totalCost: true, vehicle: { select: { plateNumber: true } } } }),
                prisma.loginAttempt.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, status: true, ipAddress: true } })
            ]),
            getExchangeRate('GHS', userCurrency),
            getDataDaysCount()
        ]);

        const [incomeSum, expenseSum, fuelSum] = financials;
        const [vehicleCount, statusCounts] = vehicleStats;
        const [recentI, recentE, recentF, recentLogins] = recentLogs;

        const totals = {
            income: Number(incomeSum._sum?.amount || 0) * rate,
            expense: Number(expenseSum._sum?.amount || 0) * rate,
            fuel: Number(fuelSum._sum?.totalCost || 0) * rate
        };

        const transactions = [
            ...recentI.map(i => ({ id: i.id, date: i.date, type: 'income', display: i.source, amount: Number(i.amount) * rate, vehicle: i.vehicle })),
            ...recentE.map(e => ({ id: e.id, date: e.date, type: 'expense', display: e.category, amount: Number(e.amount) * rate, vehicle: e.vehicle })),
            ...recentF.map(f => ({ id: f.id, date: f.date, type: 'fuel', display: `Fuel: ${f.stationName}`, amount: Number(f.totalCost) * rate, vehicle: f.vehicle }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        res.json({
            status: 'Success',
            data: {
                total_income: totals.income,
                total_expense: totals.expense,
                total_fuel_cost: totals.fuel,
                net_profit: totals.income - (totals.expense + totals.fuel),
                currency: userCurrency,
                total_vehicles: vehicleCount,
                status_distribution: statusCounts.reduce((acc: any, curr) => ({ ...acc, [curr.status]: curr._count._all }), {}),
                recent_transactions: transactions,
                recent_logins: recentLogins,
                data_days: dataDays,
                timeframe_valid: timeframe === 'all' || dataDays >= 7
            }
        });
    } catch (error) {
        console.error('Summary Error:', error);
        res.status(500).json({ status: 'Error', message: 'Failed to load intelligence summary' });
    }
};

export const getAIAnalysis = async (req: Request, res: Response) => {
    try {
        const timeframe = (req.query.timeframe as string) || 'all';
        const userCurrency = (req.query.currency as string) || 'GHS';
        const dateRange = timeframe !== 'all' ? getTimeframeRange(timeframe) : undefined;
        const where = dateRange ? { date: dateRange } : {};

        // 1. Fetch High-Fidelity Data
        const [financials, vehicles, rate] = await Promise.all([
            Promise.all([
                prisma.income.aggregate({ where, _sum: { amount: true } }),
                prisma.expense.aggregate({ where, _sum: { amount: true } }),
                prisma.fuelPurchase.aggregate({ where, _sum: { totalCost: true } })
            ]),
            prisma.vehicle.findMany({
                where: { deletedAt: null },
                include: {
                    incomes: { where },
                    expenses: { where },
                    fuelPurchases: { where }
                }
            }),
            getExchangeRate('GHS', userCurrency)
        ]);

        const [incomeSum, expenseSum, fuelSum] = financials;

        // 2. Compute Precision Metrics
        const stats = {
            income: Number(incomeSum._sum?.amount || 0) * rate,
            expense: Number(expenseSum._sum?.amount || 0) * rate,
            fuel: Number(fuelSum._sum?.totalCost || 0) * rate
        };

        const totalOps = stats.expense + stats.fuel;
        const netProfit = stats.income - totalOps;
        const profitMargin = stats.income > 0 ? (netProfit / stats.income) * 100 : 0;
        const fuelEfficiency = stats.income > 0 ? (stats.fuel / stats.income) * 100 : 0;

        // 3. Asset Performance Identification
        const problematic = vehicles
            .map(v => {
                const vIncome = v.incomes.reduce((s, i) => s + Number(i.amount), 0);
                const vExpense = v.expenses.reduce((s, e) => s + Number(e.amount), 0);
                const vFuel = v.fuelPurchases.reduce((s, f) => s + Number(f.totalCost), 0);
                const vNet = (vIncome - (vExpense + vFuel)) * rate;
                return { plate: v.plateNumber, net: vNet };
            })
            .sort((a, b) => a.net - b.net)
            .filter(v => v.net < 0);

        const worst = problematic[0];

        // 4. Intelligence Synthesis
        const dateDesc = dateRange ? `since ${dateRange.gte.toLocaleDateString()}` : "all-time";
        const netProfitLabel = netProfit >= 0 ? 'Profit' : 'Loss';

        if (netProfit < 0) {
            // Trigger notification for loss
            const admin = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
            if (admin) {
                await NotificationService.createNotification(
                    admin.id,
                    'error',
                    'Financial Deficit Alert',
                    `Your fleet is currently operating at a loss of ${formatCurrency(Math.abs(netProfit), userCurrency)} for this period.`
                );
            }
        }

        let aiSummary = `Business Summary (${dateDesc}):
        - How much did I earn? You brought in ${formatCurrency(stats.income, userCurrency)}.
        - How much did I spend? You spent ${formatCurrency(totalOps, userCurrency)}, including ${formatCurrency(stats.fuel, userCurrency)} for fuel.
        - Did I make a profit or loss? You made a ${netProfitLabel.toLowerCase()} of ${formatCurrency(Math.abs(netProfit), userCurrency)}.
        - What should I improve? Look at reducing high costs and checking vehicles that aren't making enough money.`;

        let status = profitMargin > 15 ? "Healthy" : profitMargin > 0 ? "Stable" : "Critical";
        let recommendations: string[] = ["Monitor high-cost vehicles", "Optimize fuel routes", "Review operational burn"];

        const model = getAIModel();
        if (model) {
            try {
                // Add randomization instruction and higher temperature for varied results
                const prompt = `You are a professional business coach explaining fleet performance to a person with NO financial background. Talk as if you are having a conversation over coffee.

                DATA FOR YOU TO EXPLAIN:
                - Total Cash In: ${formatCurrency(stats.income, userCurrency)}
                - Total Cash Out: ${formatCurrency(totalOps, userCurrency)}
                - Fuel Spending: ${formatCurrency(stats.fuel, userCurrency)}
                - Result: ${netProfit >= 0 ? "Profit of " : "Loss of "}${formatCurrency(Math.abs(netProfit), userCurrency)}
                - Efficiency: ${profitMargin.toFixed(1)}%
                - Problem Vehicles: ${problematic.length} out of ${vehicles.length} aren't making money.

                YOUR TASK:
                1. Don't use terms like "Net Profit", "Margin", or "Telemetry".
                2. Explain the "Loss" situation (if any) as "spending more than you are taking in" and why it happened based on the fuel/expense ratio.
                3. Use a "Good News / Bad News" or "Current Reality" style of speaking.
                4. Keep the summary under 150 words.

                Return ONLY JSON with these exact fields:
                {"summary": "A conversational story explaining what happened this week with the money.", "recommendations": ["Simple action step 1", "Simple action step 2", "Simple action step 3"], "status": "Healthy/Stable/Critical"}`;

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, topP: 0.9 } // Higher temperature for randomness
                });
                const aiData = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
                aiSummary = aiData.summary;
                status = aiData.status;
                recommendations = aiData.recommendations;
            } catch (e) {
                console.error("[AI] Analysis bypass:", e);
            }
        }

        res.json({
            status: 'Success',
            data: {
                overall_status: status.toLowerCase(),
                status_label: status === "Healthy" ? "Healthy" : status === "Critical" ? "Critical Warning" : "Stable",
                status_color: status === "Healthy" ? "green" : status === "Critical" ? "red" : "blue",
                profit_margin: profitMargin.toFixed(1),
                ai_summary: aiSummary,
                fuel_efficiency: `${((stats.fuel / (stats.income || 1)) * 100).toFixed(1)}% of income spent on fuel`,
                recommendations
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Analytical engine failure' });
    }
};

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message, history } = req.body;
        const userCurrency = (req.query.currency as string) || 'GHS';

        // Fetch deep context for intelligent analysis
        const [incomeSum, expenseSum, fuelSum, vehicles] = await Promise.all([
            prisma.income.aggregate({ _sum: { amount: true } }),
            prisma.expense.aggregate({ _sum: { amount: true } }),
            prisma.fuelPurchase.aggregate({ _sum: { totalCost: true } }),
            prisma.vehicle.findMany({
                where: { deletedAt: null },
                include: {
                    incomes: { take: 10, orderBy: { date: 'desc' } },
                    expenses: { take: 10, orderBy: { date: 'desc' } }
                }
            })
        ]);

        const stats = {
            income: Number(incomeSum._sum?.amount || 0),
            expense: Number(expenseSum._sum?.amount || 0),
            fuel: Number(fuelSum._sum?.totalCost || 0),
            vehicleCount: vehicles.length
        };

        // Construct high-fidelity context for the AI
        const vehicleSummary = vehicles.map(v => `${v.vehicleName} (${v.plateNumber}): Status ${v.status}`).join(', ');
        const rate = await getExchangeRate('GHS', userCurrency);
        const statsConverted = {
            income: stats.income * rate,
            expense: (stats.expense + stats.fuel) * rate
        };

        const sysInstruction = `You are the J.Express Neural Analytics Core.
        FLEET CONTEXT: ${stats.vehicleCount} vehicles active. Assets: ${vehicleSummary}.
        CURRENT VIEWPORT: ${userCurrency} mode.
        FINANCIAL STATE: Revenue ${formatCurrency(statsConverted.income, userCurrency)}, Burn ${formatCurrency(statsConverted.expense, userCurrency)}.

        PRINCIPLES:
        1. VISUALIZATION: Use 'bar' for vehicle comparisons, 'line' for time trends, 'pie' for cost distributions.
        2. STRUCTURE: Always provide a textual analysis first.
        3. DATA PAYLOAD: If a chart is relevant, append EXACTLY: CHART_DATA: {"type": "bar|pie|line", "data": [{"label": "Name", "value": 123}]}
        4. ACCURACY: Use real data. If a specific vehicle detail is missing, say so.`;

        const model = getAIModel(sysInstruction);
        if (!model) return res.status(503).json({ status: 'Error', message: 'Neural link offline' });

        const chat = model.startChat({
            history: history?.map((h: any) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.parts?.[0]?.text || h.text || '' }]
            })) || [],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.2 } // Lower temperature for more consistent data mapping
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        res.json({ status: 'Success', reply });
    } catch (error: any) {
        console.error('[Neural Error]:', error);
        // Handle common SDK errors gracefully
        const message = error.message?.includes('404') ? 'Model endpoint not found. Verify API version.' : 'Neural communication failure';
        res.status(500).json({ status: 'Error', message });
    }
};

export const getVehiclePerformance = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const [incomeSum, expenseSum, fuelSum, fuelLogs] = await Promise.all([
            prisma.income.aggregate({ where: { vehicleId: id }, _sum: { amount: true } }),
            prisma.expense.aggregate({ where: { vehicleId: id }, _sum: { amount: true } }),
            prisma.fuelPurchase.aggregate({ where: { vehicleId: id }, _sum: { totalCost: true } }),
            prisma.fuelPurchase.findMany({ where: { vehicleId: id }, orderBy: { date: 'asc' }, take: 30 })
        ]);

        const metrics = {
            totalI: Number(incomeSum._sum?.amount || 0),
            totalE: Number(expenseSum._sum?.amount || 0),
            totalF: Number(fuelSum._sum?.totalCost || 0)
        };

        res.json({
            status: 'Success',
            data: {
                vehicleId: id,
                totalIncome: metrics.totalI,
                totalExpense: metrics.totalE,
                totalFuelCost: metrics.totalF,
                netProfit: metrics.totalI - metrics.totalE - metrics.totalF,
                fuelConsumptionTrend: fuelLogs.map(f => ({ date: f.date, liters: f.liters }))
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Asset telemetry failed' });
    }
};
