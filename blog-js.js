document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const message = document.getElementById('search-message');

    // メインビジュアルのクリックカウント
    let clickCount = 0;
    const mainVisual = document.getElementById('main-visual');
    
    if (mainVisual) {
        mainVisual.addEventListener('click', function() {
            clickCount++;
            
            // クリック時のフィードバック
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
            
            if (clickCount >= 5) {
                // パスワード入力ポップアップを表示
                showPasswordModal();
                clickCount = 0; // カウントをリセット
            }
        });
    }

    // パスワードモーダルを表示
    function showPasswordModal() {
        // モーダル背景
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'password-modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;

        // モーダルボックス
        const modalBox = document.createElement('div');
        modalBox.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            animation: slideUp 0.3s ease;
        `;

        modalBox.innerHTML = `
            <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 1.5rem; text-align: center;">🔒 パスワードを入力</h2>
            <input type="password" id="secret-password" placeholder="パスワードを入力..." style="
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #ecf0f1;
                border-radius: 8px;
                font-size: 1rem;
                margin-bottom: 20px;
                box-sizing: border-box;
                outline: none;
            " />
            <div style="display: flex; gap: 10px;">
                <button id="password-submit" style="
                    flex: 1;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                ">確認</button>
                <button id="password-cancel" style="
                    flex: 1;
                    background: #ecf0f1;
                    color: #7f8c8d;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                ">キャンセル</button>
            </div>
            <p id="password-error" style="
                color: #e74c3c;
                font-size: 0.9rem;
                margin-top: 15px;
                text-align: center;
                min-height: 20px;
            "></p>
        `;

        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);

        const passwordInput = document.getElementById('secret-password');
        const submitBtn = document.getElementById('password-submit');
        const cancelBtn = document.getElementById('password-cancel');
        const errorMsg = document.getElementById('password-error');

        // フォーカスを当てる
        passwordInput.focus();

        // 確認ボタン
        submitBtn.addEventListener('click', function() {
            checkPassword();
        });

        // Enterキーでも送信
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });

        // キャンセルボタン
        cancelBtn.addEventListener('click', function() {
            closeModal();
        });

        // 背景クリックで閉じる
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        function checkPassword() {
            const password = passwordInput.value;
            const correctPassword = 'secret'; // パスワードを設定（変更可能）

            if (password === correctPassword) {
                // 正しいパスワード
                errorMsg.style.color = '#27ae60';
                errorMsg.textContent = '✓ 正解！移動します...';
                
                setTimeout(() => {
                    // 画面を暗転させる演出
                    document.body.style.transition = 'opacity 0.5s';
                    document.body.style.opacity = '0';
                    
                    setTimeout(() => {
                        window.location.href = 'dark-blog.html';
                    }, 500);
                }, 500);
            } else {
                // 間違ったパスワード
                errorMsg.textContent = '✗ パスワードが違います';
                passwordInput.value = '';
                passwordInput.style.borderColor = '#e74c3c';
                
                // エラーアニメーション
                modalBox.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    modalBox.style.animation = '';
                    passwordInput.style.borderColor = '#ecf0f1';
                }, 500);
            }
        }

        function closeModal() {
            modalOverlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let rawInput = input.value.trim();
        if (!rawInput) return;

        // 制御文字の除去
        rawInput = rawInput.replace(/[\x00-\x1F\x7F\u2028\u2029]/g, '');
        
        // 全角スペースを半角に統一
        rawInput = rawInput.replace(/\u3000/g, ' ');

        // スペースで分割
        const parts = rawInput.split(/\s+/).filter(Boolean);
        
        if (parts.length > 2) {
            message.textContent = '[ERROR] 入力は2ワードまでにしてください';
            message.className = 'search-message error';
            return;
        }

        // AB・BA で2パターン生成（2語限定）
        let searchTerms = [];
        if (parts.length === 2) {
            const [a, b] = parts;
            searchTerms = [a + b, b + a];
        } else {
            searchTerms = [rawInput];
        }

        let found = false;
        let pendingCount = searchTerms.length;

        // searchフォルダからJSONファイルを読み込み
        searchTerms.forEach(term => {
            if (found) return;

            const filePath = './search/' + term + '.json';
            
            message.textContent = '[LOADING] ' + term + ' を検索中...';
            message.className = 'search-message loading';

            fetch(filePath)
                .then(response => {
                    if (!response.ok) throw new Error('読み込み失敗');
                    if (found) return;
                    found = true;
                    return response.json();
                })
                .then(data => {
                    if (!found || !data) return;
                    
                    displaySearchResult(data, term);
                    input.value = '';
                })
                .catch(() => {
                    pendingCount--;
                    if (!found && pendingCount === 0) {
                        message.textContent = '[ERROR] データが見つかりませんでした';
                        message.className = 'search-message error';
                        setTimeout(() => {
                            message.textContent = '';
                        }, 3000);
                    }
                });
        });
    });

    function displaySearchResult(data, keyword) {
        // 検索結果を表示
        message.textContent = '[SUCCESS] 検索結果が見つかりました';
        message.className = 'search-message loading';

        setTimeout(() => {
            message.textContent = '';
        }, 2000);

        // 検索結果エリアを作成
        const container = document.querySelector('.container');
        let resultArea = document.getElementById('search-result-area');
        
        // 検索結果の挿入位置を判定
        let insertTarget;
        const placeholder = document.getElementById('search-result-placeholder');
        if (placeholder) {
            // 個別記事ページの場合：プレースホルダーの位置に挿入
            insertTarget = placeholder;
        } else {
            // トップページの場合：最初のdiary-entryの前に挿入
            insertTarget = container.querySelector('.diary-entry');
        }
        
        if (!resultArea) {
            resultArea = document.createElement('div');
            resultArea.id = 'search-result-area';
            resultArea.style.marginBottom = '40px';
            
            if (placeholder) {
                placeholder.appendChild(resultArea);
            } else {
                container.insertBefore(resultArea, insertTarget);
            }
        }

        const comment = data.comment.replace(/\n/g, '<br>');
        
        resultArea.innerHTML = `
            <div class="diary-entry" style="border: 2px solid #667eea; animation: slideUp 0.6s ease;">
                <div class="entry-date-header" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                    <div style="flex: 1;">
                        <div style="font-size: 1.2rem; font-weight: 600;">🔍 検索結果</div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 5px;">キーワード: ${keyword}</div>
                    </div>
                    <button onclick="closeSearchResult()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;">✕ 閉じる</button>
                </div>
                <div class="entry-content">
                    <h2 class="entry-title">検索結果: ${keyword}</h2>
                    <p class="entry-text">${comment}</p>
                    ${data.url ? `<div style="margin-top: 20px;"><a href="${data.url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease;">→ リンク先へ移動</a></div>` : ''}
                    <div class="entry-tags" style="margin-top: 20px;">
                        <span class="tag">#検索結果</span>
                        <span class="tag">#${keyword}</span>
                        ${data.type ? `<span class="tag">#${data.type}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
});

function closeSearchResult() {
    const resultArea = document.getElementById('search-result-area');
    if (resultArea) {
        resultArea.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            resultArea.remove();
            document.getElementById('search-message').textContent = '';
        }, 300);
    }
}