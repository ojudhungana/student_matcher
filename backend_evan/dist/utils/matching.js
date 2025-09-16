function ageFromBirthday(birthday) {
    if (!birthday)
        return null;
    const dob = new Date(birthday);
    if (Number.isNaN(dob.getTime()))
        return null;
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
export function scoreCandidate(me, other) {
    let score = 0;
    if (me.major && other.major && me.major === other.major)
        score += 3;
    if (me.year && other.year && me.year === other.year)
        score += 2;
    if (me.commuter_status && other.commuter_status && me.commuter_status === other.commuter_status)
        score += 1;
    const meAge = ageFromBirthday(me.birthday);
    const otherAge = ageFromBirthday(other.birthday);
    if (meAge && otherAge) {
        const diff = Math.abs(meAge - otherAge);
        if (diff <= 1)
            score += 2;
        else if (diff <= 3)
            score += 1;
    }
    if (me.tags?.length && other.tags?.length) {
        const shared = new Set(me.tags.filter(t => other.tags.includes(t)));
        score += shared.size * 1.5;
    }
    score += Math.random() * 0.25;
    return score;
}
