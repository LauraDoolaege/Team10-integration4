export async function errorLoader({ params }) {
    const errorCode = params.error;
    return {errorCode};
}
