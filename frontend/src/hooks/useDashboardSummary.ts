import { useQuery } from '@tanstack/react-query';
import dashboardApi, {
    type DashboardSummaryQuery,
} from '@/lib/api/endpoints/dashboard';

export const useDashboardSummary = (params?: DashboardSummaryQuery) => {
    return useQuery({
        queryKey: ['dashboard-summary', params],
        queryFn: () => dashboardApi.getSummary(params),
    });
};
