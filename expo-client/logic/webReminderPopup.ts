//got help from claude for some of this code, I've never used typescript before
//NOTE: this is for the WEB BROWSER version

//handles asking permission  to show notifications 
//parsing the time of notification into actual hours and minutes and calculating the delay from current time to reminder --> in 24 hour time 
//sending the popup at the correct moment using setTimeout 

//get schedule type so that typescript knows what the schedule object looks like 
import { Schedule } from "../models/Schedule";

//ask the user if we can show them notifications 
//if true they said yes, false = no 
export function requestPopupPermission(): Promise<boolean> {
    return new Promise((resolve) => {

        //check if browser supports notifications 
        if (!("Notification" in window)) {
            console.warn("This browser does not support notifications");
            resolve(false); //can't do notifs 
            return;
        }

        //if user said yes before, no need to ask again 
        if (Notification.permission === "granted") {
            resolve(true);
        } else { 
            //ask user --> triggering an "allow notifs?" popup in browser
            Notification.requestPermission().then((permission) => {
                resolve(permission === "granted"); //true if they clicked allow
            });
        }
    });
}

//now to actually schedule the reminder popup 
//take schedule oject (medication name, etc)
export async function scheduleWebReminder(schedule: Schedule): Promise<void> {

    //check for permission
    const granted = await requestPopupPermission();
    if (!granted) {
        console.warn("Notification permission not granted");
        return;
    }
    

    //time is stored as a string, so we split it into pieces 
    const [timePart, modifier] = schedule.time.split(" "); //timePart = "8:00", modifier "AM"
    let [hours, minutes] = timePart.split(":").map(Number); //hours = 8, minutes = 0
    
    //convert to 24h 
    if (modifier === "PM" && hours !== 12) hours += 12; //3pm becomes 15
    if (modifier === "AM" && hours === 12) hours = 0; //12 AM becomes 00

    //get the current time 
    const now = new Date();

    //set the target time as the time specified by user for reminder 
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    //if time has already passed today, set it for tmrw 
    if (target <= now) target.setDate(target.getDate() + 1);

    //get number of miliseconds from current time to target time 
    const delay = target.getTime() - now.getTime();

    //use custom label if they set one, otherwise just the medication name
    const label = schedule.reminderLabel || schedule.medicationName;

    //wait until target time, and then send notif popup
    //using notification API 
    setTimeout(() => {
        new Notification("TabSafe reminder", {
            body: 'Its time!', //defaul message in popup
            icon: "/assets/icon.png", //icon shown next to popup
        });
    }, delay); //how long to wait in milliseconds 
}