// Capitalize First Letter
export const capitalizeFirstLetter = (value) => {
  if (!value) return ''
  return `${value[0].toUpperCase()}${value.slice(1)}`
}
