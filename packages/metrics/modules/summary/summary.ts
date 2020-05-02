import { defaultRegister } from '../client';

const getSummary = () => defaultRegister.metrics();
const getContentType = () => defaultRegister.contentType;

export { getSummary, getContentType };
