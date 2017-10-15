const axios = require('axios');
const fs = require('fs');
const inquirer = require('inquirer');
const program = require('commander');
program
  .option('--url [subscription url]', 'subscription url')
  .option('--group [proxy group name]', 'proxy group name')
  .option('--write-to-iCloud', 'write to iCloud Documents if set ', false)
  .parse(process.argv);

(async function() {
  try {
    let subscriptionUrl = program.url;
    if (!subscriptionUrl) {
      ({ subscriptionUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'subscriptionUrl',
          message: 'Enter your subscription link',
        },
      ]));
    }
    const { data: originalConf } = await axios
      .get(subscriptionUrl)
      .catch(error => {
        throw new Error(
          'Download configuration file failed, please check your subscription url and try later',
        );
      });
    let mainGroupName = program.group;
    if (!mainGroupName) {
      ({ mainGroupName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'mainGroupName',
          message: 'Enter your proxy group name',
        },
      ]));
    }
    let mainGroup;
    try {
      mainGroup = originalConf.match(new RegExp(`${mainGroupName} = .*`))[0];
    } catch (error) {
      throw new Error(`Can't find your proxy group of name ${mainGroupName}`);
    }
    const autoGroup = mainGroup
      .replace(mainGroupName, 'Auto')
      .replace(
        'select,',
        'url-test,url = http://www.gstatic.com/generate_204,',
      );
    const newGroups =
      mainGroup.replace('select,', 'select,Auto,') + '\n' + autoGroup;
    const escapedSubscription = subscriptionUrl.replace('?', '\\?');
    const confWithAuto = originalConf
      .replace(new RegExp(`.*${escapedSubscription}.*`), '')
      .replace(mainGroup, newGroups);
    const writePath = program.writeToICloud
      ? `${process.env
          .HOME}/Library/Mobile Documents/iCloud~run~surge/Documents/${mainGroupName}_with_auto.conf`
      : require('path').resolve(__dirname, `${mainGroupName}_with_auto.conf`);
    fs.writeFileSync(writePath, confWithAuto);
    console.log(`Success, check your new configuration file at: ${writePath}`);
  } catch (error) {
    console.log(error);
  }
})();
