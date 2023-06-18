

/**
 * Zips the name array and boat array, if a person is not allocated a boat, UNALLOCATED will be tagged to the name
 *
 * @export
 * @param {string[]} name array of names
 * @param {string[]} boat array of boat allocation
 * @return {[string, string][]} 
 */
export function zipNameAndBoatAlloc(name:string[], boat:string[]): [string, string][] {
    const boatAlloc: [string, string][] = []
    for (let i = 0; i < name.length; i++) {
        if (name[i].length == 0) { continue; }
        if ( (i + 1) > boat.length || (boat[i].length == 0 ))  {
            boatAlloc.push([name[i], "UNALLOCATED"])
        } else {
            boatAlloc.push([name[i], boat[i]])
        }
    }
    return boatAlloc
}