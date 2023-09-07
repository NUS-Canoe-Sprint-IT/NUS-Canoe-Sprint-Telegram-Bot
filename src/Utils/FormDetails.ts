import { User } from './User';

export class FormDetails {
    user: User;
    certifiedPaddlers: string;
    nonCertifiedPaddlers: string;
    startTime: string;
    endTime: string;

    constructor(user=new User(), certifiedPaddlers='', nonCertifiedPaddlers='', startTime='', endTime='') {
        this.user = user
        this.certifiedPaddlers = certifiedPaddlers
        this.nonCertifiedPaddlers = nonCertifiedPaddlers
        this.startTime = startTime
        this.endTime = endTime
    }

    toString() {
        return 'Name: ' + this.user.name +
            '\nContact number: ' + this.user.hp +
            '\nNumber of Certified Paddler(s): ' + this.certifiedPaddlers +
            '\nNumber of Non-Certified Paddler(s): ' + this.nonCertifiedPaddlers +
            '\nStart time: ' + this.startTime +
            '\nEnd time: ' + this.endTime;
    }
}
