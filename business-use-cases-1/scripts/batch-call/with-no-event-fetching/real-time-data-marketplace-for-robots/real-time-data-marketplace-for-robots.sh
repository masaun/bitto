echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the real-time-data-marketplace-for-robots.clar ..."
npx tsx real-time-data-marketplace-for-robots_batch-call_with-no-event-fetching.ts 
