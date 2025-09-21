import { INavData } from '@coreui/angular';

export interface INavDataWithRoles extends INavData {
  roles?: string[];
  feature?: string;
  children?: INavDataWithRoles[];
}
