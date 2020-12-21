import { defaultRegister } from '../client';

const getSummary = async () => defaultRegister.metrics();
const getContentType = () => defaultRegister.contentType;

export { getSummary, getContentType };
