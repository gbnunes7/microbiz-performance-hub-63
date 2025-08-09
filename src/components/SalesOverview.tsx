
import { useState } from 'react';
import { Grid } from '@/components/ui/grid';
import ComparisonCard from '@/components/ComparisonCard';
import KpiChart from '@/components/KpiChart';
import { DataAnalysis } from '@/components/DataAnalysis';
import { useGoals } from '@/contexts/GoalsContext';
import { Period, DateRange } from '@/types/metrics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getSalesData = (period: Period, dateRange?: DateRange, goals?: any) => {
  // Simple function to generate dates for chart labels based on date range
  const generateDateLabels = (startDate: Date, endDate: Date, numPoints: number) => {
    const result = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const interval = Math.max(1, Math.floor(daysDiff / numPoints));
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < numPoints && currentDate <= endDate; i++) {
      result.push({
        date: new Date(currentDate),
        label: format(currentDate, 'dd/MM', { locale: ptBR })
      });
      currentDate.setDate(currentDate.getDate() + interval);
    }
    
    // Ensure the end date is included
    if (result.length > 0 && result[result.length - 1].date < endDate) {
      result.push({
        date: new Date(endDate),
        label: format(endDate, 'dd/MM', { locale: ptBR })
      });
    }
    
    return result;
  };
  
  if (period === 'custom' && dateRange) {
    // Calculate days in the selected period for scaling data
    const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysInMonth = 30; // Average month length for simple scaling
    const scaleFactor = daysDiff / daysInMonth;
    
    // Generate date labels for the charts
    const dateLabels = generateDateLabels(dateRange.startDate, dateRange.endDate, 9);
    
    // Scale the monthly data based on the selected date range
    const totalRevenue = Math.round(78500 * scaleFactor);
    const productRevenue = Math.round(42200 * scaleFactor);
    const serviceRevenue = Math.round(36300 * scaleFactor);
    const goalValue = Math.round((goals?.sales || 85000) * scaleFactor);
    
    // Generate sales chart data
    const salesChart = dateLabels.map((item, index) => {
      const progressRatio = (index + 1) / dateLabels.length;
      return {
        name: item.label,
        current: Math.round(totalRevenue * progressRatio),
        previous: Math.round(totalRevenue * 0.9 * progressRatio),
        goal: Math.round(goalValue * progressRatio)
      };
    });
    
    return {
      totalRevenue,
      revenueComparison: 22,
      productRevenue,
      productComparison: 18,
      serviceRevenue,
      serviceComparison: 26,
      ticketAverage: 265,
      ticketComparison: 8,
      salesChart,
      revenueByType: [
        { 
          name: 'Produtos', 
          current: productRevenue, 
          previous: Math.round(productRevenue * 0.85),
          goal: Math.round((goals?.productRevenue || 42000) * scaleFactor),
          comparison: Math.round(((productRevenue - Math.round(productRevenue * 0.85)) / Math.round(productRevenue * 0.85)) * 100)
        },
        { 
          name: 'Serviços', 
          current: serviceRevenue, 
          previous: Math.round(serviceRevenue * 0.8),
          goal: Math.round((goals?.serviceRevenue || 43000) * scaleFactor),
          comparison: Math.round(((serviceRevenue - Math.round(serviceRevenue * 0.8)) / Math.round(serviceRevenue * 0.8)) * 100)
        },
      ],
      ticketChart: dateLabels.map((item) => ({
        name: item.label,
        current: 265 + Math.round(Math.random() * 20 - 10),
        previous: 250 + Math.round(Math.random() * 20 - 10),
        goal: goals?.ticketAverage || 265,
      })),
      goalValue,
    };
  } else {
    // Fallback to monthly data
    return {
      totalRevenue: 78500,
      revenueComparison: 22,
      productRevenue: 42200,
      productComparison: 18,
      serviceRevenue: 36300,
      serviceComparison: 26,
      ticketAverage: 265,
      ticketComparison: 8,
      salesChart: [
        { name: '01/04', current: 18500, previous: 16800 },
        { name: '08/04', current: 19200, previous: 17500 },
        { name: '15/04', current: 20800, previous: 18200 },
        { name: '22/04', current: 20000, previous: 19000 },
      ],
      revenueByType: [
        { 
          name: 'Produtos', 
          current: 42200, 
          previous: 36000,
          goal: goals?.productRevenue || 42000,
          comparison: Math.round(((42200 - 36000) / 36000) * 100)
        },
        { 
          name: 'Serviços', 
          current: 36300, 
          previous: 28800,
          goal: goals?.serviceRevenue || 43000,
          comparison: Math.round(((36300 - 28800) / 28800) * 100)
        },
      ],
      ticketChart: [
        { name: '01/04', current: 260, previous: 240, goal: goals?.ticketAverage || 265 },
        { name: '08/04', current: 265, previous: 245, goal: goals?.ticketAverage || 265 },
        { name: '15/04', current: 270, previous: 250, goal: goals?.ticketAverage || 265 },
        { name: '22/04', current: 265, previous: 245, goal: goals?.ticketAverage || 265 },
      ],
      goalValue: goals?.sales || 85000,
    };
  }
};

interface SalesOverviewProps {
  period: Period;
  dateRange?: DateRange;
}

const SalesOverview = ({ period, dateRange }: SalesOverviewProps) => {
  const { goals } = useGoals();
  const data = getSalesData(period, dateRange, goals);
  const goalPercentage = data.goalValue ? (data.totalRevenue / data.goalValue) * 100 : 0;
  
  const getPeriodDescription = () => {
    if (period === 'custom' && dateRange) {
      const formatDate = (date: Date) => format(date, 'd MMMM', { locale: ptBR });
      return `Período: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    }
    return 'Meta mensal';
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComparisonCard
          title="Faturamento Total"
          value={data.totalRevenue}
          comparison={data.revenueComparison}
          prefix="R$ "
          goalPercentage={goalPercentage}
          description={getPeriodDescription()}
        />
        <ComparisonCard
          title="Faturamento em Produtos"
          value={data.productRevenue}
          comparison={data.productComparison}
          prefix="R$ "
        />
        <ComparisonCard
          title="Faturamento em Serviços"
          value={data.serviceRevenue}
          comparison={data.serviceComparison}
          prefix="R$ "
        />
        <ComparisonCard
          title="Ticket Médio"
          value={data.ticketAverage}
          comparison={data.ticketComparison}
          prefix="R$ "
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <KpiChart 
          title="Faturamento por Período" 
          subtitle="Comparação com mesmo período do mês anterior"
          data={data.salesChart}
          type="bar"
          comparison={data.revenueComparison}
          prefix="R$ "
          goalValue={data.goalValue}
          height={375}
        />
        <KpiChart 
          title="Faturamento por Tipo" 
          data={data.revenueByType}
          type="bar"
          prefix="R$ "
          height={375}
        />
      </div>

      <div className="grid grid-cols-1 mt-6">
        <KpiChart 
          title="Ticket Médio" 
          data={data.ticketChart}
          type="line"
          comparison={data.ticketComparison}
          prefix="R$ "
          goalValue={goals?.ticketAverage}
        />
      </div>

      <DataAnalysis 
        title="Análise dos Números - Vendas" 
        data={{
          type: "sales",
          metrics: {
            totalRevenue: data.totalRevenue,
            revenueComparison: data.revenueComparison,
            productRevenue: data.productRevenue,
            serviceRevenue: data.serviceRevenue,
            ticketAverage: data.ticketAverage,
            goalValue: data.goalValue
          }
        }}
      />
    </>
  );
};

export default SalesOverview;
