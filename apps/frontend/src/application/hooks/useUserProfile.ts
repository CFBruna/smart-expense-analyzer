import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UserProfile, UpdateProfileData } from '../services/user.service';

export function useUserProfile() {
    return useQuery<UserProfile>({
        queryKey: ['user', 'profile'],
        queryFn: () => userService.getProfile(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user', 'profile'], updatedUser);
        },
    });
}
