
export type Period = 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesData {
  totalRevenue: number;
  revenueComparison: number;
  productRevenue: number;
  productComparison: number;
  serviceRevenue: number;
  serviceComparison: number;
  ticketAverage: number;
  ticketComparison: number;
  goalValue: number;
}

export interface CustomersData {
  customersServed: number;
  customersComparison: number;
  newCustomers: number;
  newCustomersComparison: number;
  productsPerClient: number;
  productsComparison: number;
  servicesPerClient: number;
  servicesComparison: number;
  goalCustomersServed: number;
  goalNewCustomers: number;
  goalProductsPerClient: number;
  goalServicesPerClient: number;
}

export interface MarketingData {
  investment: number;
  investmentComparison: number;
  leadsGenerated: number;
  leadsGeneratedComparison: number;
  leadsMeetings: number;
  leadsMeetingsComparison: number;
  sales: number;
  salesComparison: number;
  cpl: number;
  cplComparison: number;
  leadToMeetingRate: number;
  leadToMeetingRateComparison: number;
  meetingToSaleRate: number;
  meetingToSaleRateComparison: number;
  roas: number;
  roasComparison: number;
  goalInvestment: number;
  goalLeadsGenerated: number;
  goalLeadsMeetings: number;
  goalSales: number;
  goalCpl: number;
  goalLeadToMeetingRate: number;
  goalMeetingToSaleRate: number;
  goalRoas: number;
}

export interface Goals {
  // Sales goals
  sales: number;
  productRevenue: number;
  serviceRevenue: number;
  ticketAverage: number;
  
  // Customer goals
  customers: number;
  newCustomers: number;
  productsPerClient: number;
  servicesPerClient: number;
  
  // Marketing goals
  marketing: number;
  leadsGenerated: number;
  leadsMeetings: number;
  marketingSales: number;
  cpl: number;
  leadToMeetingRate: number;
  meetingToSaleRate: number;
  roas: number;
}

export interface MonthlyGoal {
  month: string;
  value: number;
}
