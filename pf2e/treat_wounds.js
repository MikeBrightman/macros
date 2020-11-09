/* 
  This is a script that rolls a selected actor's medicine against a "Teat Wounds" roll.
  It outputs two roll results into the chat log:
  1. The level of medicine check and result of the medicine roll by the selected actor
  2. The resulting hitpoint changes according to the degree of succes (even if zero)
  
  Holding down keys when you run/click the macro changes the Difficulty Class (DC) of the roll.
  Hold down the corresponding keys for a different roll
    - None: Trained, DC 15, no additional healing
    - Ctrl: Expert, DC 20, 10 additional healing
    - Alt: Master, DC 30, 30 additional healing
    - Ctrl+Alt: Legendary, DC 40, 50 additional healing
  
  For this to work, you need to have your character token selected.

  Developed using rules found at https://2e.aonprd.com/Actions.aspx?ID=57 as of the 9th of November, 2020
  Please check this page if you are preparing to use treat wounds often, and want a better understanding
  or if you have questions about the roll itself (or DM/Player discussion).

  TODO:
  Take into account Medic Dedication Feat (additional healing effect)
  Take into account Feats such as Natural medicine (use alternate proficiency bonus)
  Factor in other bonuses such as 
    item (e.g. expanded healer's tools, Serene Mutagen)
    status (e.g. Heroism 3rd level Spell, Competitive Edge Focus Spell) 
    circumstance (e.g. Risky Surgery Feat + deal damage before healing, 
                 Fresh Ingredients Herbalist Dedication Skill Feat + item cost)
*/


// Outcome prefix text for each case
let Success_flavor_msg = "Success, you will heal:";
let Failure_flavor_msg = "Failure";
let Dmg_flavor_msg = "Damage taken:";

// Select difficulty class + determine bonus to result based on keys held
let dc_text = "(Trained, DC 15)";
let dc_mod = 0
if(event.ctrlKey) {
  if(event.altKey) {
    dc_text = "(Legendary, DC 40)";
    dc_mod = 25;
  }
  else
  {
    dc_text = "(Expert, DC 20)";
    dc_mod = 5;
  }
}
else if(event.altKey) {
  dc_text = "(Master, DC 30)";
  dc_mod = 15;
}
let BonusHealFromDC = dc_mod*2;
let failThresh = 14+dc_mod;

// Roll the outcome
let skillRoll = new Roll("1d20+@skills.med.value", token.actor.getRollData());
skillRoll.roll();
skillRoll.toMessage({
  flavor: "Treat wounds "+dc_text,
  speaker: ChatMessage.getSpeaker({token: token})
});

let result = skillRoll.total; //final result with modifiers
let crit = skillRoll.result[0] == 20; //0 or 1 respresenting a crit roll

let successRoll = new Roll('2d8+@bonusheal', {BonusHealFromDC});
let critSuccessRoll = new Roll('4d8+@bonusheal', {BonusHealFromDC});
let failureRoll = new Roll("0d0");
let critFailureRoll = new Roll("1d8");

// Comparing the medicine check with the DC and returning the corresponding result
let hitPointRoll;
let outcomeText = "";
if(result>failThresh)
{
    outcomeText +=Success_flavor_msg;
    hitPointRoll = successRoll;
    if(result-10>failThresh)
    {
        outcomeText = "Critical " + outcomeText;
        hitPointRoll = critSuccessRoll;
    }
}
else
{
    outcomeText += Failure_flavor_msg;
    hitPointRoll = failureRoll;
    if(failThresh-9>result)
    {
        outcomeText = "Critical " + outcomeText;
        hitPointRoll = critFailureRoll;
    }
}

switch (successLevel) {
  case 0:
    //crit failure
    day = "Sunday";
    break;
  case 1:
    //crit failure
    day = "Sunday";
    break;
  case 2:
    //crit failure
    day = "Sunday";
    break;
  case 3:
    //crit failure
    day = "Sunday";
    break;
}

hitPointRoll.roll();
hitPointRoll.toMessage({
    flavor: "result "+ result + ", " + outcomeText,
    speaker: ChatMessage.getSpeaker({token: token})
  });