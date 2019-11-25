const validateRequest = ({ tableName, operation, dataKeys, excludeAdminEvents, comparisonFunction }) => req => {
  const { table = {}, event = {} } = req.body

  if (
    table.name !== tableName ||
    event.op !== operation ||
    !event.data ||
    (Array.isArray(dataKeys) && dataKeys.some(key => !event.data[key]))
  ) {
    return true
  }

  if (excludeAdminEvents && event.session_variables && event.session_variables['x-hasura-role'] === 'admin') {
    return true
  }

  if (typeof comparisonFunction === 'function' && comparisonFunction(event.data.old, event.data.new)) {
    return true
  }

  return false
}

module.exports = {
  validateRequest
}