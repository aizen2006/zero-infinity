
export interface WidgetConfig {
  app: string;
  widgetType: string;
  dataFields: string[];
  filters: Filter[];
  displaySettings: DisplaySettings;
}

export interface Filter {
  field: string;
  operator: string;
  value: string;
}

export interface DisplaySettings {
  title: string;
  size: 'small' | 'medium' | 'large';
  color: string;
  refreshRate: number;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  fields: string[];
}

export interface WidgetType {
  id: string;
  name: string;
  icon: string;
  description: string;
}
