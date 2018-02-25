export const baseUrl = 'http://localhost:8848/';
export const contextName = 'api/';
export const apiUrl = `${baseUrl}${contextName}`;

export const uri = {
  dashboard: apiUrl,
  images: `${apiUrl}annotations`,
  uploadImages: `${apiUrl}patients/images`,
  patients: `${apiUrl}patients`,
  annotation: `${apiUrl}annotations`,
  users:`${apiUrl}users`,
  authenticate:`${apiUrl}users/authenticate`,
  tags:`${apiUrl}tags`,
  batches:`${apiUrl}batches`,
  annotationLabels:`${apiUrl}annotationLabels`
}
