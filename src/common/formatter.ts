/**
 * 指定した区切り文字で文字列を連結する共通フォーマッター。
 *
 * @param prefix 先頭に付与する文字列
 * @param suffix 末尾に付与する文字列（undefined の場合は含めない）
 * @param separator 要素間に使用する区切り文字
 * @param args 連結対象の文字列または数値
 * @returns prefix、args、suffix を separator で連結した文字列
 */
function _format(
    prefix: string,
    suffix: string | undefined,
    separator: string,
    ...args: (string | number)[]
) {
    return [prefix, ...args, suffix]
        .filter((s) => s !== undefined)
        .map((v) => v.toString())
        .join(separator);
}

/**
 * ID 形式の文字列を生成する。
 *
 * 例: `cell-1`, `board-header`
 *
 * @param prefix 先頭の識別子
 * @param suffix 末尾の識別子（undefined の場合は省略）
 * @param args 連結する追加要素
 * @returns ハイフン区切りの ID 文字列
 */
export function formatId(
    prefix: string,
    suffix: string | undefined,
    ...args: (string | number)[]
) {
    return _format(prefix, suffix, '-', ...args);
}

/**
 * CSS クラス名を生成する。
 *
 * 例: `board_cell`, `status_open`
 *
 * @param prefix 先頭の識別子
 * @param suffix 末尾の識別子（undefined の場合は省略）
 * @param args 連結する追加要素
 * @returns アンダースコア区切りのクラス名
 */
export function formatClass(
    prefix: string,
    suffix: string | undefined,
    ...args: (string | number)[]
) {
    return _format(prefix, suffix, '_', ...args);
}
