echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the mezzanine-junior-debt.clar ..."
npx tsx mezzanine-junior-debt_batch-call_with-no-event-fetching.ts 
