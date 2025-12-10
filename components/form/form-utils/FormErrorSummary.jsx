// Helper to flatten nested errors
const flattenErrors = (errors, prefix = '') => {
  const flattened = [];

  Object.entries(errors).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && 'message' in value) {
      // This is an error object
      flattened.push({ field: path, message: value.message });
    } else if (value && typeof value === 'object') {
      // This is a nested object, recurse
      flattened.push(...flattenErrors(value, path));
    }
  });

  return flattened;
};

export const FormErrorSummary = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  const errorList = flattenErrors(errors);

  if (errorList.length === 0) {
    return null;
  }

  return (
    <div className="bg-destructive/15 p-3 rounded-md border border-destructive/20">
      <h4 className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
      <ul className="text-sm text-destructive space-y-1">
        {errorList.map(({ field, message }, index) => (
          <li key={`${field}-${index}`} className="flex items-start gap-2">
            <span className="text-destructive">•</span>
            <span>
              <strong>{field}:</strong> {message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}; 