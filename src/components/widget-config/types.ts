export interface WidgetConfig {
  app: string;
  widgetType: string;
  dataFields: string[];
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  displaySettings: {
    title: string;
    size: 'small' | 'medium' | 'large';
    color: string;
    refreshRate: number;
  };
}