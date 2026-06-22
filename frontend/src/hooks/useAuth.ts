import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import { setCredentials, logout, setUser, setLoading } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state: any) => state.auth);

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('login', credentials);
      return data;
    },
    // Page handles success/error for better UX
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('resend-otp', { email });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'New code sent!');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to resend code';
      toast.error(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (otpData: { email: string; code: string }) => {
      const { data } = await api.post('verify-otp', otpData);
      return data.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.access_token }));
      toast.success('Identity Verified. Welcome back!');
      navigate('/dashboard');
    },
    // Page handles error for shake animation
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const { data } = await api.post('google-login', { idToken });
      return data.data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.access_token }));
      toast.success('Access granted via Google');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Google authentication failed';
      toast.error(msg);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('logout');
    },
    onSuccess: () => {
      dispatch(logout());
      navigate('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('forgot-password', { email });
      return data;
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (resetData: any) => {
      const { data } = await api.post('reset-password', resetData);
      return data;
    }
  });

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('user');
      dispatch(setUser(data.data));
    } catch (error) {
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateProfile = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.put('profile', userData);
      return data.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data));
      toast.success('Profile updated');
    }
  });

  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: (data) => {
      dispatch(setUser({ ...user, profileImage: data.profileImage }));
      toast.success('Image uploaded');
    }
  });

  const deleteProfileImage = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('profile/image');
      return data.data;
    },
    onSuccess: (data) => {
      dispatch(setUser({ ...user, profileImage: data.profileImage }));
      toast.success('Image reset');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const { data } = await api.post('change-password', passwordData);
      return data;
    },
    onSuccess: (data) => {
      if (data.data?.access_token) {
        dispatch(setCredentials({ user, token: data.data.access_token }));
      }
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    }
  });

  const requestAccessMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('request-access', formData);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Request submitted');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to submit request';
      toast.error(msg);
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('register', userData);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Account created successfully!');
      navigate('/login');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    },
  });

  const fetchLoginAttempts = async () => {
    const { data } = await api.get('login-attempts');
    return data.data;
  };

  const fetchSecurityLogs = async () => {
    const { data } = await api.get('security-logs');
    return data.data;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    resendOtp: resendOtpMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    fetchUser,
    fetchLoginAttempts,
    fetchSecurityLogs,
    updateProfile: updateProfile.mutate,
    uploadProfileImage: uploadProfileImage.mutate,
    deleteProfileImage: deleteProfileImage.mutate,
    changePassword: changePasswordMutation.mutate,
    requestAccess: requestAccessMutation.mutate,
    register: registerMutation.mutate,
    isLoggingIn: loginMutation.isLoading || registerMutation.isLoading,
    isResending: resendOtpMutation.isLoading,
    isVerifying: verifyOtpMutation.isLoading,
    isGoogleLoggingIn: googleLoginMutation.isLoading,
    isUpdating: updateProfile.isLoading || uploadProfileImage.isLoading || deleteProfileImage.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
    isRequesting: requestAccessMutation.isLoading,
    isForgotting: forgotPasswordMutation.isLoading,
    isResetting: resetPasswordMutation.isLoading,
    loginSuccess: loginMutation.isSuccess,
  };
};
