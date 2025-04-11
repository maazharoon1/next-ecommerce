// create a helper function to format currency which takes an amount and currency code and returns a formatted string

export function formatCurrency(amount: number, currencyCode: string = "USD") {
   try {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode.toLowerCase(),
    }).format(amount);
   } catch (error) {
    console.error("Error Currency Code",currencyCode, error);
    return `${currencyCode.toUpperCase()} ${amount.toFixed(2)}`
   }
}