#!/bin/bash
# Push app

if ! cf app $CF_APP; then  
  cf push $CF_APP -n ${CF_APP}-${CF_SPACE}
else
  OLD_CF_APP=${CF_APP}-OLD-$(date +"%s")
  rollback() {
    set +e  
    if cf app $OLD_CF_APP; then
      cf logs $CF_APP --recent
      cf delete $CF_APP -f
      cf rename $OLD_CF_APP $CF_APP
    fi
    exit 1
  }
  set -e
  trap rollback ERR
  cf rename $CF_APP $OLD_CF_APP
  cf push $CF_APP -n ${CF_APP}-${CF_SPACE}
  cf delete $OLD_CF_APP -f
fi
# Export app name and URL for use in later Pipeline jobs
export CF_APP_NAME="$CF_APP"
export APP_URL=http://$(cf app $CF_APP_NAME | grep -e urls: -e routes: | awk '{print $2}')
# View logs
#cf logs "${CF_APP}" --recent

cf set-env $CF_APP ENV_TARGET $ENV_TARGET 
cf set-env $CF_APP IMAGE_VERSION $IDS_VERSION
cf restage $CF_APP