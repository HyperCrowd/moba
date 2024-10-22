/**
 * 
 */
export function getConcatenatedDates () {
  const currentDate = new Date()
  const previousDate = new Date(currentDate)
  
  // Subtract one day (24 hours in milliseconds)
  previousDate.setDate(currentDate.getDate() - 1)
  
  // Function to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
  };

  // Get formatted dates
  const currentDateString = formatDate(currentDate)
  const previousDateString = formatDate(previousDate)

  // Concatenate the dates
  return `${previousDateString}/${currentDateString}`
}