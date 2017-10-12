const axios = require('axios');
const fs = require('fs');

const subscriptionUrl = process.env.SURGE_SUBSCRIPTION; // replace with your subscriptioin url
const mainGroupName = process.env.SURGE_MAIN_GROUP; // replace with your group name
const escapedSubscription = subscriptionUrl.replace('?', '\\?');
(async function() {
  const { data: originalConf } = await axios.get(subscriptionUrl);
  const mainGroup = originalConf.match(new RegExp(`${mainGroupName} = .*`))[0];
  const autoGroup = mainGroup
    .replace(mainGroupName, 'Auto')
    .replace('select,', 'url-test,url = http://www.gstatic.com/generate_204,');
  const newGroups =
    mainGroup.replace('select,', 'select,Auto,') + '\n' + autoGroup;
  const confWithAuto = originalConf
    .replace(new RegExp(`.*${escapedSubscription}.*`), '')
    .replace(mainGroup, newGroups);
  fs.writeFileSync(
    `${process.env
      .HOME}/Library/Mobile Documents/iCloud~run~surge/Documents/surge_with_auto.conf`,
    confWithAuto,
  );
})();
