/**
 * 指定した時間待つ
 * ## 引数
 * - n : 待つ時間（ミリ秒）
 *
 * ## 例
 * ```
 * await sleep(3000); // 3秒待機する
 * ```
 */
export async function sleep(n: number) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  })
}