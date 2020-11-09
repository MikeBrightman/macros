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

  TODO checklist:
  Take into account crit/fumble rolls (1 or 20 on the die)
  Take into account Medic Dedication Feat (additional healing effect)
  Take into account Feats such as Natural medicine (use alternate proficiency bonus)
  Factor in other bonuses such as 
    item (e.g. expanded healer's tools, Serene Mutagen)
    status (e.g. Heroism 3rd level Spell, Competitive Edge Focus Spell) 
    circumstance (e.g. Risky Surgery Feat + deal damage before healing, 
                 Fresh Ingredients Herbalist Dedication Skill Feat + item cost)
*/


// Outcome prefix text for each case
// These can be changed to add more interesting flavourtext to the outcomes
let Success_flavor_msg = "Success. Recipent will heal: ";
let Failure_flavor_msg = "Failure. ";
let Critical_Failure_flavor_msg = "Damage caused to recipient: ";

// Select difficulty class + determine bonus to result (based on keys held)
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
let failThreshold = 14+dc_mod;

// Roll the check outcome and output to chat as a standard roll
let skillRoll = new Roll("1d20+@skills.med.value", token.actor.getRollData());
skillRoll.roll();
skillRoll.toMessage({
  flavor: "Treat wounds " + dc_text,
  speaker: ChatMessage.getSpeaker({token: token})
});

let result = skillRoll.total; //final result with modifiers

//Setup available outcomes
let successRoll = new Roll('2d8+@BonusHealFromDC', {BonusHealFromDC});
let critSuccessRoll = new Roll('4d8+@BonusHealFromDC', {BonusHealFromDC});
let failureRoll = new Roll("0d0");
let critFailureRoll = new Roll("1d8");

// Comparing the medicine check with the DC and returning the corresponding result
let hitPointRoll;
let outcomeText = "";
if(result>failThreshold)
{
    outcomeText +=Success_flavor_msg;
    hitPointRoll = successRoll;
    if(result-10>failThreshold)
    {
        outcomeText = "Critical " + outcomeText;
        hitPointRoll = critSuccessRoll;
    }
}
else
{
    outcomeText += Failure_flavor_msg;
    hitPointRoll = failureRoll;
    if(failThreshold-9>result)
    {
        outcomeText = "Critical " + outcomeText + Critical_Failure_flavor_msg;
        hitPointRoll = critFailureRoll;
    }
}

hitPointRoll.roll();
hitPointRoll.toMessage({
    flavor: outcomeText,
    speaker: ChatMessage.getSpeaker({token: token})
  });