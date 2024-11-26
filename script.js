document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const drawer = document.querySelector('.drawer');
    const drawerButton = document.querySelector('.drawer-button');
    const createPostBtn = document.querySelector('.create-post-btn');
    const createPostModal = document.getElementById('createPostModal');
    const closeCreatePostBtn = document.getElementById('closeCreatePost');
    const createPostForm = document.querySelector('.create-post-form');

    // 添加缺失的元素引用
    const editorContent = document.querySelector('.editor-content');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.querySelector('.image-preview-container');

    // 抽屉按钮点击事件
    drawerButton.addEventListener('click', function(event) {
        drawer.classList.toggle('open');
        event.stopPropagation();
    });

    // 点击页面其他地方关闭抽屉
    document.addEventListener('click', function(event) {
        if (!drawer.contains(event.target) && !drawerButton.contains(event.target)) {
            drawer.classList.remove('open');
        }
    });

    // 发帖按钮点击事件
    createPostBtn.addEventListener('click', () => {
        createPostModal.classList.add('show');
    });

    // 关闭发帖模态窗口
    closeCreatePostBtn.addEventListener('click', () => {
        createPostModal.classList.remove('show');
    });

    // 点击模态窗口外部关闭
    createPostModal.addEventListener('click', (e) => {
        if (e.target === createPostModal) {
            createPostModal.classList.remove('show');
        }
    });

    // 处理评论提交
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reply-btn')) {
            const commentInput = e.target.previousElementSibling;
            const commentsList = e.target.closest('.post-comments').querySelector('.comments-list');
            const commentText = commentInput.value.trim();
            
            if (commentText) {
                // 创建新评论
                const newComment = `
                    <div class="comment-item">
                        <div class="comment-content">
                            <div class="comment-main">
                                <span class="comment-author">${document.getElementById('userName').textContent}：</span>
                                <span class="comment-text">${commentText}</span>
                            </div>
                            <div class="comment-info">
                                <span class="comment-time">${getCurrentTime()}</span>
                                <button class="more-btn comment-more">
                                    <i class="fas fa-ellipsis-h"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // 在评论列表的开头添加新评论
                commentsList.insertAdjacentHTML('afterbegin', newComment);
                
                // 清空输入框
                commentInput.value = '';
            } else {
                showAlert('请输入评论内容');
            }
        }

        // 处理评论菜单
        if (e.target.closest('.comment-more')) {
            const menu = e.target.closest('.comment-actions').querySelector('.comment-menu');
            menu.classList.toggle('show');
            e.stopPropagation();
        }

        // 处理评论编辑
        if (e.target.closest('.edit-comment')) {
            const commentItem = e.target.closest('.comment-item');
            const commentText = commentItem.querySelector('.comment-text').textContent;
            const commentInput = commentItem.closest('.post-comments').querySelector('.comment-box');
            
            // 填充评论框
            commentInput.value = commentText;
            commentInput.focus();
            
            // 关闭菜单
            const menu = e.target.closest('.comment-menu');
            menu.classList.remove('show');
            
            // 删除原评论
            commentItem.remove();
        }

        // 处理贴子删除
        if (e.target.closest('.delete-post')) {
            const post = e.target.closest('.post');
            elementToDelete = post;
            deleteType = 'post';
            confirmModal.classList.add('show');
            // 关闭菜单
            const menu = e.target.closest('.post-menu');
            menu.classList.remove('show');
        }

        // 处理评论删除
        if (e.target.closest('.delete-comment')) {
            const commentItem = e.target.closest('.comment-item');
            elementToDelete = commentItem;
            deleteType = 'comment';
            confirmModal.classList.add('show');
            // 关闭菜单
            const menu = e.target.closest('.comment-menu');
            menu.classList.remove('show');
        }
    });

    // 添加获取当前时间的辅助函数
    function getCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 处理贴子菜单
    document.addEventListener('click', function(e) {
        // 关闭所有打开的菜单
        const openMenus = document.querySelectorAll('.post-menu.show, .comment-menu.show');
        openMenus.forEach(menu => {
            if (!menu.contains(e.target) && !e.target.closest('.more-btn')) {
                menu.classList.remove('show');
            }
        });

        // 处理贴子的更多按钮点击
        if (e.target.closest('.post-actions .more-btn')) {
            const menu = e.target.closest('.post-actions').querySelector('.post-menu');
            menu.classList.toggle('show');
            e.stopPropagation();
        }

        // 处理贴子编辑
        if (e.target.closest('.edit-post')) {
            const post = e.target.closest('.post');
            const title = post.querySelector('.post-title').textContent;
            const content = post.querySelector('.post-text').innerHTML;
            
            // 打开发帖模态窗口
            createPostModal.classList.add('show');
            // 填充现有内容
            createPostForm.querySelector('.post-title-input').value = title;
            editorContent.innerHTML = content;
            
            // 标记为编辑模式
            createPostForm.dataset.editMode = 'true';
            createPostForm.dataset.editPostId = post.id || Date.now();
            
            // 更改提交按钮文字
            createPostForm.querySelector('.submit-btn').textContent = '保存修改';
            
            // 关闭菜单
            const menu = e.target.closest('.post-menu');
            menu.classList.remove('show');
        }
    });

    // 修改发帖表单提交处理
    createPostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = this.querySelector('.post-title-input').value;
        const content = editorContent.innerHTML;
        const images = Array.from(imagePreviewContainer.querySelectorAll('img')).map(img => img.src);

        if (this.dataset.editMode === 'true') {
            // 编辑模式
            const postId = this.dataset.editPostId;
            const post = document.querySelector(`[id="${postId}"]`) || document.querySelector('.post');
            
            post.querySelector('.post-title').textContent = title;
            post.querySelector('.post-text').innerHTML = content;
            
            // 重置表单
            this.dataset.editMode = 'false';
            this.dataset.editPostId = '';
            this.querySelector('.submit-btn').textContent = '发布';
        } else {
            // 创建新贴子
            const newPost = `
                <div class="post">
                    <div class="post-header">
                        <div class="post-info">
                            <span class="post-author">${document.getElementById('userName').textContent}</span>
                            <span class="post-time">${getCurrentTime()}</span>
                        </div>
                        <div class="post-actions">
                            <button class="more-btn">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div class="post-menu">
                                <button class="menu-item edit-post">
                                    <i class="fas fa-edit"></i>
                                    修改
                                </button>
                                <button class="menu-item delete-post">
                                    <i class="fas fa-trash-alt"></i>
                                    删除
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="post-content">
                        <h2 class="post-title">${title}</h2>
                        <div class="post-text">${content}</div>
                        ${images.length ? `
                            <div class="post-images">
                                ${images.map(src => `<img src="${src}" alt="贴子图片" onclick="showImage('${src}')">`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="post-comments">
                        <div class="comment-input">
                            <span class="comment-user">${document.getElementById('userName').textContent}</span>
                            <input type="text" placeholder="添加评论..." class="comment-box">
                            <button class="reply-btn">回复</button>
                        </div>
                        <div class="comments-list"></div>
                    </div>
                </div>
            `;

            // 将新贴子插入到主内容区域的开头
            const main = document.querySelector('main');
            const firstPost = main.querySelector('.post');
            if (firstPost) {
                firstPost.insertAdjacentHTML('beforebegin', newPost);
            } else {
                main.insertAdjacentHTML('beforeend', newPost);
            }
        }

        // 关闭模态窗口并重置表单
        createPostModal.classList.remove('show');
        this.reset();
        editorContent.innerHTML = '';
        imagePreviewContainer.innerHTML = '';
    });

    // 获取确认弹窗相关元素
    const confirmModal = document.getElementById('confirmModal');
    const confirmBtn = confirmModal.querySelector('.confirm-btn');
    const cancelBtn = confirmModal.querySelector('.cancel-btn');
    let elementToDelete = null;
    let deleteType = '';

    // 确认除
    confirmBtn.addEventListener('click', () => {
        if (elementToDelete) {
            elementToDelete.remove();
            elementToDelete = null;
        }
        confirmModal.classList.remove('show');
    });

    // 取消删除
    cancelBtn.addEventListener('click', () => {
        elementToDelete = null;
        confirmModal.classList.remove('show');
    });

    // 点击弹窗外部关闭
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            elementToDelete = null;
            confirmModal.classList.remove('show');
        }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmModal.classList.contains('show')) {
            elementToDelete = null;
            confirmModal.classList.remove('show');
        }
    });

    // 添加提示弹窗相关元素
    const alertModal = document.getElementById('alertModal');
    const alertMessage = alertModal.querySelector('.alert-message');
    const alertBtn = alertModal.querySelector('.alert-btn');
    const closeAlertBtn = alertModal.querySelector('.close-alert');

    // 显示提示的函数
    function showAlert(message) {
        alertMessage.textContent = message;
        alertModal.classList.add('show');
    }

    // 关闭提示
    function closeAlert() {
        alertModal.classList.remove('show');
    }

    // 绑定关闭事件
    alertBtn.addEventListener('click', closeAlert);
    closeAlertBtn.addEventListener('click', closeAlert);
    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            closeAlert();
        }
    });

    // 登录相关功能
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginBtn = loginModal.querySelector('.close-btn');
    const tabBtns = loginModal.querySelectorAll('.tab-btn');
    const tabPanels = loginModal.querySelectorAll('.tab-panel');
    const loginForm = loginModal.querySelector('.login-form');
    const registerForm = loginModal.querySelector('.register-form');
    const guestButtons = document.querySelector('.guest-buttons');
    const userButtons = document.querySelector('.user-buttons');

    // 修改登录表单提交处理部分
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = this.querySelector('input[type="text"]').value;
        const password = this.querySelector('input[type="password"]').value;

        // 验证默认账户（admin/123456）
        if (username === 'admin' && password === '123456') {
            // 更新用户名显示
            document.getElementById('userName').textContent = username;
            
            // 切换按钮组显示
            guestButtons.style.display = 'none';
            userButtons.style.display = 'block';
            
            // 关闭登录窗口
            loginModal.classList.remove('show');
            
            // 清空表单
            this.reset();
        } else {
            // 使用自定义提示替代 alert
            showAlert('用户名或密码错误！');
        }
    });

    // 处理退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        // 恢复到游客状态
        document.getElementById('userName').textContent = '游客';
        
        // 切换按钮组显示
        guestButtons.style.display = 'block';
        userButtons.style.display = 'none';
        
        // 关闭抽屉
        drawer.classList.remove('open');
    });

    // 打开登录模态窗口
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('show');
    });

    // 关闭登录模态窗口
    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    // 点击模态窗口外部关闭
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });

    // 标签切换功能
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(btn.dataset.tab + 'Panel');
            panel.classList.add('active');
        });
    });

    // 主题切换功能
    const themeBtnGuest = document.getElementById('themeBtn-guest');
    const themeBtnUser = document.getElementById('themeBtn-user');
    let isDarkTheme = false;

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        
        // 更新两个主题按钮的图标
        const themeBtns = [themeBtnGuest, themeBtnUser];
        themeBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (isDarkTheme) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });

        // 保存主题偏好到本地存储
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }

    // 初始化主题
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            toggleTheme();
        }
    }

    // 绑定主题切换事件
    themeBtnGuest.addEventListener('click', toggleTheme);
    themeBtnUser.addEventListener('click', toggleTheme);

    // 页面加载时初始化主题
    initTheme();

    // 处理图片上传
    imageUpload.addEventListener('change', (e) => {
        const files = e.target.files;
        const maxImages = 6;  // 设置最大图片数量
        const currentImages = imagePreviewContainer.querySelectorAll('.image-preview').length;
        
        // 检查是否超过最大图片数量
        if (currentImages >= maxImages) {
            showAlert('最多只能上传6张图片！');
            imageUpload.value = '';
            return;
        }

        // 计算还能上传多少张图片
        const remainingSlots = maxImages - currentImages;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'image-preview';
                    
                    previewDiv.innerHTML = `
                        <img src="${event.target.result}" alt="预览图片">
                        <button class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    imagePreviewContainer.appendChild(previewDiv);

                    // 如果达到最大数量，显示提示
                    if (imagePreviewContainer.querySelectorAll('.image-preview').length >= maxImages) {
                        showAlert('已达到最大图片数量限制！');
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // 清空input，允许重复选择相同文件
        imageUpload.value = '';
    });

    // 格式化工具栏功能
    const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-format]');
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const format = button.dataset.format;
            document.execCommand(format, false, null);
            button.classList.toggle('active');
        });
    });
}); 