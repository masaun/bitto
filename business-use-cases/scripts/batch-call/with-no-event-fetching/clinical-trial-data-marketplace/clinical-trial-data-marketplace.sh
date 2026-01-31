echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the clinical-trial-data-marketplace.clar ..."
npx tsx clinical-trial-data-marketplace_batch-call_with-no-event-fetching.ts 


## If you've run it once before (created IDs 1-10), set offset to 10:
# TRIAL_ID_OFFSET=10 sh clinical-trial-data-marketplace.sh

## Or if you've run it twice (created IDs 1-20), set offset to 20:
# TRIAL_ID_OFFSET=20 sh clinical-trial-data-marketplace.sh