export async function fetchUriageData() {
    try {
        const data = await domo.get('/data/v2/uriage?limit=100');
        return data;
    } catch (err) {
        console.error('データ取得失敗', err);
        return null;
    }
}
