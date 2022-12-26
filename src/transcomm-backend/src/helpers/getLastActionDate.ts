
export function getLastActionDate(actionDate: string | Date | null, eventTimeStamp: string): string | Date {
    if(actionDate)
        return new Date(actionDate)
    else
        return eventTimeStamp ? new Date(eventTimeStamp) : new Date()
}

