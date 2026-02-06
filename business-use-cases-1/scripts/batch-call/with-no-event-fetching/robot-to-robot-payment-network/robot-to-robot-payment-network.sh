echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the robot-to-robot-payment-network.clar ..."
npx tsx robot-to-robot-payment-network_batch-call_with-no-event-fetching.ts 
