'ust strict';
const util = {};
util.colors = require('ansi-colors');
util.log = require('fancy-log');


const color = (code, str) => {
  return `\u001b[${code}m${str}\u001b[0m`;
}

let report = [];

module.exports = (results, threshold) => {
  const violations = results.violations;

  if(violations.length) {
    if (threshold < 0) {
      report.push(util.colors.green(`"${results.url}" : Found ${violations.length} accessibility violations: (no threshold)`))
    }else if(violations.length > threshold) {
      report.push(util.colors.red(`"${results.url}" : Found ${violations.length} accessibility violations:`))
    }else {
      report.push(util.colors.green(`"${results.url}" : Found ${violations.length} accessibility violations: (under threshold of ${threshold})`));
    }

    violations.forEach( ruleResult => {
      let subject
      switch(ruleResult.impact) {
        case 'critical':
          subject = util.colors.bold.magenta(`[Critical] ${ruleResult.help}`)
          break;
        case 'serious':
          subject = util.colors.bold.red(`[Serious] ${ruleResult.help}`)
          break;
        case 'moderate':
          subject = util.colors.bold.yellow(`[Moderate] ${ruleResult.help}`)
          break;
        case 'minor':
          subject = util.colors.bold(ruleResult.help)
          break;
      }
      report.push(` ${color(31, '\u00D7')} ${subject}`)
      ruleResult.nodes.forEach( (violation, idx) => {
        report.push(`   ${idx + 1}. ${JSON.stringify(violation.target)} ${violation.html.replace(/\n/g, ' ')} `)

        if (violation.any.length) {
          report.push(`     \u25A2 Fix any of the following:`)
          violation.any.forEach(function(check) {
            report.push(`       \u2022 ${check.message.replace(/(.{1,90})/g, '$1\n         ').trim()}`)
          });
        }
        const alls = violation.all.concat(violation.none);
        if (alls.length) {
          report.push(`     \u25A2 Fix all of the following:`)
          alls.forEach( check => {
            report.push(`       \u2022 ${check.message}`)
          });
        }
        report.push('\n');
      } );
    })
  }else {
    report.push(util.colors.green(`Found no accessibility violations.`));
  }

  util.log(report.join('\n').replace(/\n\n\n+/g, '\n\n'));
}