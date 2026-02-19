
const BASE_URL = 'http://localhost:3000';
const ID_NUMERIC = '76561198881424318';
const ID_VANITY = 'twojuice';

async function check() {
    console.log('--- Checking Numeric ID ---');
    try {
        const res1 = await fetch(`${BASE_URL}/api/user/profile?steamid=${ID_NUMERIC}`);
        const data1 = await res1.json();
        console.log('Numeric Response:', JSON.stringify(data1, null, 2));

        console.log('\n--- Checking Vanity ID ---');
        const res2 = await fetch(`${BASE_URL}/api/user/profile?steamid=${ID_VANITY}`);
        const data2 = await res2.json();
        console.log('Vanity Response:', JSON.stringify(data2, null, 2));

        if (data1.found && data2.found) {
            if (data1.profile.steam_id === data2.profile.steam_id) {
                console.log('\nMATCH: Both resolve to same steam_id');
            } else {
                console.log('\nMISMATCH: Different steam_id returned!');
                console.log('Numeric ->', data1.profile.steam_id);
                console.log('Vanity  ->', data2.profile.steam_id);
            }
        } else {
            console.log('\nOne or both profiles not found.');
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

check();
