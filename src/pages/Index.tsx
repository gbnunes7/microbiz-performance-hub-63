
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from '@/components/DashboardLayout';
import SalesOverview from '@/components/SalesOverview';
import CustomerMetrics from '@/components/CustomerMetrics';
import MarketingPerformance from '@/components/MarketingPerformance';
import MenuGoals from '@/components/MenuGoals';
import { GeneralAnalysis } from '@/components/GeneralAnalysis';
import { DashboardCards } from '@/components/DashboardCards';
import CustomersList from '@/components/CustomersList';
import SalesList from '@/components/SalesList';
import MetricsHeader from '@/components/MetricsHeader';
import { Period, DateRange } from '@/types/metrics';
import { useGoals } from '@/contexts/GoalsContext';
import { ImportVendasDialog } from '@/components/ImportVendasDialog';

// Helper function to get previous month's equivalent date range
const getPreviousMonthDateRange = (dateRange: DateRange): DateRange => {
  const prevStartDate = new Date(dateRange.startDate);
  prevStartDate.setMonth(prevStartDate.getMonth() - 1);
  
  const prevEndDate = new Date(dateRange.endDate);
  prevEndDate.setMonth(prevEndDate.getMonth() - 1);
  
  return {
    startDate: prevStartDate,
    endDate: prevEndDate
  };
};

// Function to get default date range (first day of month to today)
const getDefaultDateRange = (): DateRange => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return {
    startDate: firstDayOfMonth,
    endDate: now
  };
};

const getGeneralData = (dateRange: DateRange, goals: any, filial: 'all' | number) => {
  // Simulated data based on date range and filial
  const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysInMonth = 30; // Average month length for simple scaling
  const timeScale = daysDiff / daysInMonth;
  const branchScale = filial === 'all' ? 1 : 0.9 + ((Number(filial) % 3) * 0.05);

  const scale = timeScale * branchScale;

  return {
    sales: {
      totalRevenue: Math.round(78500 * scale),
      revenueComparison: 22,
      productRevenue: Math.round(42200 * scale),
      productComparison: 18,
      serviceRevenue: Math.round(36300 * scale),
      serviceComparison: 26,
      ticketAverage: 265,
      ticketComparison: 8,
      goalValue: Math.round((goals?.sales || 85000) * scale),
    },
    customers: {
      customersServed: Math.round(296 * scale),
      customersComparison: 18.4,
      newCustomers: Math.round(85 * scale),
      newCustomersComparison: 30.8,
      productsPerClient: 1.8,
      productsComparison: 12.5,
      servicesPerClient: 3.2,
      servicesComparison: 6.7,
      goalCustomersServed: Math.round((goals?.customers || 300) * scale),
      goalNewCustomers: Math.round((goals?.newCustomers || 90) * scale),
      goalProductsPerClient: goals?.productsPerClient || 2.0,
      goalServicesPerClient: goals?.servicesPerClient || 3.5
    },
    marketing: {
      investment: Math.round(4500 * scale),
      investmentComparison: 7,
      leadsGenerated: Math.round(240 * scale),
      leadsGeneratedComparison: 25,
      leadsMeetings: Math.round(155 * scale),
      leadsMeetingsComparison: 18,
      sales: Math.round(95 * scale),
      salesComparison: 12,
      cpl: 18.75,
      cplComparison: -8.5,
      leadToMeetingRate: 64.6,
      leadToMeetingRateComparison: 6.4,
      meetingToSaleRate: 61.3,
      meetingToSaleRateComparison: 4.8,
      roas: 5.59,
      roasComparison: 10.5,
      goalInvestment: Math.round((goals?.marketing || 5000) * scale),
      goalLeadsGenerated: Math.round((goals?.leadsGenerated || 260) * scale),
      goalLeadsMeetings: Math.round((goals?.leadsMeetings || 170) * scale),
      goalSales: Math.round((goals?.marketingSales || 105) * scale),
      goalCpl: goals?.cpl || 19.25,
      goalLeadToMeetingRate: goals?.leadToMeetingRate || 65.4,
      goalMeetingToSaleRate: goals?.meetingToSaleRate || 61.8,
      goalRoas: goals?.roas || 6.0
    }
  };
};

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [activeTab, setActiveTab] = useState('overview');
  const [filial, setFilial] = useState<'all' | number>('all');
  const period: Period = 'custom';
  const { goals } = useGoals();
  const generalData = getGeneralData(dateRange, goals, filial);



  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <DashboardLayout headerTitle="Dashboard">
      <div className="px-6">
        <DashboardCards />
        <div className="flex items-center justify-end mt-4 mb-4">
          <ImportVendasDialog />
        </div>
        <MetricsHeader 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
          filial={filial}
          onFilialChange={setFilial}
          availableFiliais={[1,2,3]}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Vendas</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="analysis">Análise Geral</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <SalesOverview period={period} dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-6">
            <CustomerMetrics period={period} dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <CustomersList />
          </TabsContent>

          <TabsContent value="vendas" className="space-y-6">
            <SalesList />
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <MarketingPerformance period={period} dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <GeneralAnalysis 
              salesData={generalData.sales}
              customersData={generalData.customers}
              marketingData={generalData.marketing}
              period={period}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <MenuGoals />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
