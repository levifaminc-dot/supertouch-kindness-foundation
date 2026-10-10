import {defineCliConfig} from 'sanity/cli';
import settings from './config/sanity.json';
export default defineCliConfig({api:{projectId:settings.projectId,dataset:settings.dataset},deployment:{appId:'p2d3ma4rytn2psk0ko7tnmd3'}});
