// --- Firebase Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadString,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Initialization ---
    const firebaseConfig = {
      apiKey: "AIzaSyAHzZEsVCse2ha42prCSu_76l_XuVoGfQg",
      authDomain: "redefit-3b5d8.firebaseapp.com",
      projectId: "redefit-3b5d8",
      storageBucket: "redefit-3b5d8.firebasestorage.app",
      messagingSenderId: "91680842195",
      appId: "1:91680842195:web:ca20af9318593879d70f26",
      measurementId: "G-ZC3GH283DN"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    // FIX: Pass the Firebase app instance to getFirestore for consistency and to prevent potential initialization issues. The original error was likely caused by this inconsistency.
    const db = getFirestore(app);
    const storage = getStorage(app);

    // --- Mock Database (will be progressively replaced) ---
    // usersDB now acts as a cache and holds mock data for non-logged-in users
    let usersDB: { [uid: string]: any } = {
        'jp': {
            uid: 'jp',
            username: 'joao_pereira',
            displayName: 'João Pereira',
            sport: 'Musculação',
            initials: 'JP',
            profilePicture: 'https://images.unsplash.com/photo-1577221084712-45b044c67917?q=80&w=1974&auto=format&fit=crop',
            isOnline: false,
            lastSeen: new Date().getTime() - 300000, // 5 minutes ago
        },
        'mr': {
            uid: 'mr',
            username: 'maria_runner',
            displayName: 'Maria Runner',
            sport: 'Corrida',
            initials: 'MR',
            profilePicture: 'https://images.unsplash.com/photo-1594751543129-670a64e2ca6a?q=80&w=1974&auto=format&fit=crop',
            isOnline: true,
            lastSeen: new Date().getTime(),
        }
    };

    let productsDB = [
        {
            productId: 'prod1',
            userId: 'jp',
            name: 'Tênis de Corrida Pro',
            price: 399.90,
            location: 'São Paulo, SP',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
            description: 'Tênis de corrida profissional, ideal para maratonas. Usado apenas 2 vezes, em perfeito estado. Tamanho 42.'
        },
        {
            productId: 'prod2',
            userId: 'mr',
            name: 'Kit Halteres 10kg',
            price: 249.90,
            location: 'Rio de Janeiro, RJ',
            imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=2071&auto=format&fit=crop',
            description: 'Kit completo de halteres de 10kg cada, com barra emborrachada. Perfeito para treinar em casa.'
        }
    ];

    let storiesDB: { [userId: string]: any[] } = {
        'mr': [{
            storyId: 'story_mr1',
            mediaUrl: 'https://videos.pexels.com/video-files/852424/852424-hd.mp4',
            mediaType: 'video',
            duration: 5000
        }],
    };

    const musicDB = [
        { id: 'm1', title: 'Power Up', artist: 'Eletronic Beats', genre: 'electronic' },
        { id: 'm2', title: 'Iron Beast', artist: 'Workout Anthems', genre: 'maromba' },
        { id: 'm3', title: 'Neon Dreams', artist: 'Synthwave Masters', genre: 'electronic' },
        { id: 'm4', title: 'No Pain No Gain', artist: 'Gym Motivation', genre: 'maromba' },
        { id: 'm5', title: 'Future Rush', artist: 'EDM Central', genre: 'electronic' }
    ];
    
    let chatsDB: { [chatId: string]: any } = {
        'chat1': {
            chatId: 'chat1',
            participants: ['user123', 'jp'],
            isGroup: false,
            messages: [
                { messageId: 'm1', senderId: 'jp', type: 'text', content: 'E aí, tudo certo com o treino?', timestamp: new Date().getTime() - 86400000 },
                { messageId: 'm2', senderId: 'user123', type: 'text', content: 'Tudo ótimo! Hoje foi dia de peito. E o seu?', timestamp: new Date().getTime() - 90000 },
            ],
            archivedBy: [],
            mutedBy: [],
        },
        'chat2': {
            chatId: 'chat2',
            participants: ['user123', 'mr'],
            isGroup: false,
            messages: [
                 { messageId: 'm3', senderId: 'mr', type: 'text', content: 'Vamos correr amanhã?', timestamp: new Date().getTime() - 600000 },
            ],
            archivedBy: ['user123'], // Example: current user has archived this chat
            mutedBy: [],
        },
        'chat3': {
            chatId: 'chat3',
            participants: ['user123', 'jp', 'mr'],
            isGroup: true,
            groupName: 'Galera do Treino 💪',
            groupAvatar: null,
            groupInitials: 'GT',
            messages: [
                { messageId: 'm4', senderId: 'jp', type: 'text', content: 'Alguém anima um treino em grupo no fds?', timestamp: new Date().getTime() - 1200000 },
                { messageId: 'm5', senderId: 'mr', type: 'text', content: 'Eu topo!', timestamp: new Date().getTime() - 1100000 },
                { messageId: 'm6', senderId: 'user123', type: 'text', content: 'Bora! Sábado de manhã?', timestamp: new Date().getTime() - 1000000 },
            ],
            archivedBy: [],
            mutedBy: ['user123'], // Example: current user has muted this chat
        }
    };

    let newPostImageData: string | null = null;
    let newProfilePictureDataUrl: string | null = null;
    let currentStoryData: {
        mediaUrl?: string;
        mediaType?: 'image' | 'video';
        music?: any;
        filter?: string;
        sticker?: { id: string, name: string, animation: string };
    } = {};

    // --- Authentication ---
    let currentUser: any = null;

    // Real Firebase Authentication State Listener
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                currentUser = docSnap.data();
                // Update local cache for rendering other users' content
                usersDB[user.uid] = currentUser;
                showMainApp();
            } else {
                // This can happen for a first-time Google Sign-In user before their profile is created
                console.log("User authenticated, but profile not yet created or found.");
            }
        } else {
            currentUser = null;
            showAuthScreen();
        }
    });

    // --- DOM Elements ---
    const authScreen = document.getElementById('authScreen') as HTMLElement;
    const mainApp = document.getElementById('mainApp') as HTMLElement;
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const signupForm = document.getElementById('signupForm') as HTMLFormElement;
    
    // Auth inputs and buttons
    const loginEmail = document.getElementById('loginEmail') as HTMLInputElement;
    const loginPassword = document.getElementById('loginPassword') as HTMLInputElement;
    const signupName = document.getElementById('signupName') as HTMLInputElement;
    const signupUsername = document.getElementById('signupUsername') as HTMLInputElement;
    const signupEmail = document.getElementById('signupEmail') as HTMLInputElement;
    const signupPassword = document.getElementById('signupPassword') as HTMLInputElement;
    const signupSport = document.getElementById('signupSport') as HTMLInputElement;
    const loginBtn = document.querySelector('#loginForm button.btn-primary') as HTMLElement;
    const googleLoginBtn = document.querySelector('#loginForm button.btn-secondary') as HTMLElement;
    const showSignupLink = document.querySelector('#loginForm .link') as HTMLElement;
    const signupBtn = document.querySelector('#signupForm button.btn-primary') as HTMLElement;
    const showLoginLink = document.querySelector('#signupForm .link') as HTMLElement;
    const logoutBtn = document.querySelector('.header .nav-btn') as HTMLElement;
    
    const navButtons = document.querySelectorAll('.bottom-nav .nav-btn');
    const screens = document.querySelectorAll('#mainApp .screen') as NodeListOf<HTMLElement>;
    
    // Feed
    const feedPostsContainer = document.getElementById('feedPostsContainer') as HTMLElement;
    
    // Stories Elements
    const addStoryBtn = document.getElementById('addStoryBtn') as HTMLElement;
    const storyItems = document.querySelectorAll('.story-item');
    const storyViewer = document.getElementById('storyViewer') as HTMLElement;
    const storyViewerClose = document.querySelector('.story-viewer-close') as HTMLElement;
    const storyViewerUsername = document.querySelector('.story-viewer-username') as HTMLElement;
    const storyViewerContent = document.getElementById('storyViewerContent') as HTMLElement;
    const storyProgressBar = document.querySelector('.story-viewer-progress-bar') as HTMLElement;
    let storyTimeout: number;
    
    // Story Creator Elements
    const storyCreationScreen = document.getElementById('storyCreationScreen') as HTMLElement;
    const closeStoryCreatorBtn = document.getElementById('closeStoryCreatorBtn') as HTMLElement;
    const publishStoryBtn = document.getElementById('publishStoryBtn') as HTMLElement;
    const storyMediaInput = document.getElementById('storyMediaInput') as HTMLInputElement;
    const storyPreviewContainer = document.getElementById('storyPreviewContainer') as HTMLElement;
    const openMusicPanelBtn = document.getElementById('openMusicPanelBtn') as HTMLElement;
    const openFiltersPanelBtn = document.getElementById('openFiltersPanelBtn') as HTMLElement;
    const openStickersPanelBtn = document.getElementById('openStickersPanelBtn') as HTMLElement;
    const musicSelectionPanel = document.getElementById('musicSelectionPanel') as HTMLElement;
    const filterSelectionPanel = document.getElementById('filterSelectionPanel') as HTMLElement;
    const stickerSelectionPanel = document.getElementById('stickerSelectionPanel') as HTMLElement;
    const musicList = document.getElementById('musicList') as HTMLElement;
    const filterOptionsContainer = document.getElementById('filterOptionsContainer') as HTMLElement;
    const stickerOptionsContainer = document.getElementById('stickerOptionsContainer') as HTMLElement;

    // Marketplace Elements
    const sellButton = document.querySelector('#marketplaceScreen .btn-sell') as HTMLElement;
    const useLocationButton = document.querySelector('.btn-location') as HTMLElement;
    const productsGrid = document.getElementById('productsGrid') as HTMLElement;
    const backToMarketplaceBtn = document.getElementById('backToMarketplaceBtn') as HTMLElement;
    const buyNowBtn = document.getElementById('buyNowBtn') as HTMLElement;
    
    // Product Detail Elements
    const productDetailImage = document.getElementById('productDetailImage') as HTMLImageElement;
    const productDetailName = document.getElementById('productDetailName') as HTMLElement;
    const productDetailPrice = document.getElementById('productDetailPrice') as HTMLElement;
    const productDetailSeller = document.getElementById('productDetailSeller') as HTMLElement;
    const productDetailLocation = document.getElementById('productDetailLocation') as HTMLElement;
    const productDetailDescription = document.getElementById('productDetailDescription') as HTMLElement;

    // New Product Form Elements
    const productTitleInput = document.getElementById('productTitle') as HTMLInputElement;
    const productPriceInput = document.getElementById('productPrice') as HTMLInputElement;
    const productLocationInput = document.getElementById('productLocationInput') as HTMLInputElement;
    const productDescriptionInput = document.getElementById('productDescription') as HTMLTextAreaElement;
    const publishAdBtn = document.getElementById('publishAdBtn') as HTMLElement;

    // Profile Elements
    const editProfileBtn = document.querySelector('.btn-edit') as HTMLElement;
    const backToProfileBtn = document.getElementById('backToProfileBtn') as HTMLElement;
    const saveProfileBtn = document.getElementById('saveProfileBtn') as HTMLElement;
    const profileAvatar = document.getElementById('profileAvatar') as HTMLImageElement;
    
    // Profile display elements
    const displayName = document.querySelector('.profile-name') as HTMLElement;
    const displayBio = document.querySelector('.profile-bio') as HTMLElement;
    const displaySport = document.querySelector('.profile-sport') as HTMLElement;
    const displayWeight = document.getElementById('displayWeight') as HTMLElement;
    const displayCity = document.getElementById('displayCity') as HTMLElement;
    const displayMaritalStatus = document.getElementById('displayMaritalStatus') as HTMLElement;
    const displayHobbies = document.getElementById('displayHobbies') as HTMLElement;

    // Edit Profile form elements
    const editProfileAvatar = document.getElementById('editProfileAvatar') as HTMLImageElement;
    const profilePictureInput = document.getElementById('profilePictureInput') as HTMLInputElement;
    const changePhotoBtn = document.getElementById('changePhotoBtn') as HTMLElement;
    const editName = document.getElementById('editName') as HTMLInputElement;
    const editMaritalStatus = document.getElementById('editMaritalStatus') as HTMLSelectElement;
    const editCity = document.getElementById('editCity') as HTMLInputElement;
    const editWeight = document.getElementById('editWeight') as HTMLInputElement;
    const editHobbies = document.getElementById('editHobbies') as HTMLTextAreaElement;
    const editBio = document.getElementById('editBio') as HTMLTextAreaElement;
    const editSport = document.getElementById('editSport') as HTMLInputElement;

    // New Post Elements
    const newPostImageInput = document.getElementById('newPostImageInput') as HTMLInputElement;
    const newPostImagePreview = document.getElementById('newPostImagePreview') as HTMLImageElement;
    const newPostUploadPlaceholder = document.getElementById('newPostUploadPlaceholder') as HTMLElement;
    const newPostCaption = document.getElementById('newPostCaption') as HTMLTextAreaElement;
    const publishPostBtn = document.getElementById('publishPostBtn') as HTMLElement;

    // Messages Elements
    const chatListContainer = document.getElementById('chatListContainer') as HTMLElement;
    const backToMessagesBtn = document.getElementById('backToMessagesBtn') as HTMLElement;
    const chatHeaderAvatar = document.getElementById('chatHeaderAvatar') as HTMLImageElement;
    const chatHeaderInitials = document.getElementById('chatHeaderInitials') as HTMLElement;
    const chatHeaderName = document.getElementById('chatHeaderName') as HTMLElement;
    const chatHeaderStatus = document.getElementById('chatHeaderStatus') as HTMLElement;
    const messageContainer = document.getElementById('messageContainer') as HTMLElement;
    const chatImageInput = document.getElementById('chatImageInput') as HTMLInputElement;
    const chatAttachmentBtn = document.getElementById('chatAttachmentBtn') as HTMLElement;
    const chatInput = document.getElementById('chatInput') as HTMLInputElement;
    const chatSendBtn = document.getElementById('chatSendBtn') as HTMLElement;
    const chatMicBtn = document.getElementById('chatMicBtn') as HTMLElement;
    let currentChatId: string | null = null;
    
    // --- Helper Functions ---
    function setLoading(button: HTMLElement, isLoading: boolean, originalText: string) {
        if (isLoading) {
            button.setAttribute('disabled', 'true');
            button.textContent = 'Aguarde...';
        } else {
            button.removeAttribute('disabled');
            button.textContent = originalText;
        }
    }

    // --- Auth Functions ---
    async function handleSignup(event: Event) {
        event.preventDefault();
        setLoading(signupBtn, true, 'Criar Conta');
        
        const emailValue = signupEmail.value;
        const passwordValue = signupPassword.value;
        const nameValue = signupName.value;
        const usernameValue = signupUsername.value;
        const sportValue = signupSport.value;

        if (!emailValue || !passwordValue || !nameValue || !usernameValue) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            setLoading(signupBtn, false, 'Criar Conta');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
            const user = userCredential.user;
            
            const initials = nameValue.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: nameValue,
                username: usernameValue,
                sport: sportValue || 'Entusiasta do Esporte',
                bio: `Apaixonado por ${sportValue || 'fitness'}.`,
                initials: initials,
                profilePicture: null,
                isOnline: true,
                lastSeen: new Date().getTime(),
            };

            await setDoc(doc(db, "users", user.uid), userProfile);
            // onAuthStateChanged will handle the UI update
        } catch (error: any) {
            console.error("Signup Error:", error);
            alert(`Erro ao criar conta: ${error.message}`);
        } finally {
            setLoading(signupBtn, false, 'Criar Conta');
        }
    }

    async function handleLogin(event: Event) {
        event.preventDefault();
        setLoading(loginBtn, true, 'Entrar');

        const emailValue = loginEmail.value;
        const passwordValue = loginPassword.value;

        if (!emailValue || !passwordValue) {
            alert('Por favor, preencha email e senha.');
            setLoading(loginBtn, false, 'Entrar');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, emailValue, passwordValue);
            // onAuthStateChanged will handle the UI update
        } catch (error: any) {
            console.error("Login Error:", error);
            alert(`Erro ao entrar: ${error.message}`);
        } finally {
            setLoading(loginBtn, false, 'Entrar');
        }
    }
    
    async function handleGoogleLogin(event: Event) {
        event.preventDefault();

        // Check if running in an iframe (like AI Studio) which blocks popups
        if (window.self !== window.top) {
            alert("O login com Google não é suportado nesta visualização. Por favor, use o método de email e senha para testar o cadastro e o login, que funcionam normalmente.");
            return;
        }

        setLoading(googleLoginBtn, true, 'Continuar com Google');
        
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                const username = user.email ? user.email.split('@')[0] : `user${Date.now()}`;
                const initials = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                
                const userProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    username: username,
                    sport: 'Entusiasta do Esporte',
                    bio: 'Descobrindo o mundo fitness!',
                    initials: initials,
                    profilePicture: user.photoURL,
                    isOnline: true,
                    lastSeen: new Date().getTime(),
                };
                await setDoc(userRef, userProfile);
            }
            // onAuthStateChanged will now find the profile and show the app
        } catch (error: any) {
            console.error("Google Login Error:", error);
            alert(`Erro com o login do Google: ${error.message}`);
        } finally {
            setLoading(googleLoginBtn, false, 'Continuar com Google');
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            // onAuthStateChanged will handle showing the auth screen
        } catch (error) {
            console.error("Logout Error:", error);
            alert('Erro ao sair.');
        }
    }


    // --- UI Functions ---
    function showMainApp() {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        renderFeed();
        renderMarketplace();
        renderMessagesList();
        renderProfileScreen();
        updateProfilePictures();
        showScreen('feedScreen');
        const feedNavBtn = document.querySelector('.nav-btn[data-screen="feedScreen"]');
        if (feedNavBtn) {
            document.querySelectorAll('.nav-btn.active').forEach(b => b.classList.remove('active'));
            feedNavBtn.classList.add('active');
        }
    }

    function showAuthScreen() {
        mainApp.classList.add('hidden');
        authScreen.classList.remove('hidden');
        showLogin();
    }

    function showLogin() {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    }

    function showSignup() {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }

    function showScreen(screenId: string) {
        screens.forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.remove('hidden');
                screen.scrollTop = 0;
            } else {
                screen.classList.add('hidden');
            }
        });
    }

    function handleNavClick(event: Event) {
        const button = event.currentTarget as HTMLElement;
        const screenId = button.dataset.screen;
        if (screenId) {
            const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
            if(mainHeader) mainHeader.classList.remove('hidden');
            
            if (screenId === 'profileScreen') {
                renderProfileScreen();
            }

            showScreen(screenId);
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }
    }

    // --- Feed Functions ---
    async function renderFeed() {
        if (!feedPostsContainer || !currentUser) return;
        feedPostsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Carregando feed...</p>';
        
        try {
            const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(postsQuery);
            
            feedPostsContainer.innerHTML = ''; // Clear loading message
            if (querySnapshot.empty) {
                feedPostsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhum post encontrado. Seja o primeiro a postar!</p>';
                return;
            }

            for (const doc of querySnapshot.docs) {
                const post = { id: doc.id, ...doc.data() };
                
                // Fetch user data if not in cache
                if (!usersDB[post.userId]) {
                     const userRef = doc(db, "users", post.userId);
                     const userSnap = await getDoc(userRef);
                     if(userSnap.exists()) {
                         usersDB[post.userId] = userSnap.data();
                     }
                }
                const user = usersDB[post.userId];
                if (!user) continue;

                const likedByUser = post.likedBy?.includes(currentUser.uid);
                const likesCount = post.likedBy?.length || 0;
                
                const avatarHtml = user.profilePicture
                    ? `<img src="${user.profilePicture}" alt="${user.username}" class="avatar-img">`
                    : `<div class="avatar">${user.initials}</div>`;
                
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.innerHTML = `
                    <div class="post-header">
                        ${avatarHtml}
                        <div class="post-user">
                            <div class="username">${user.username}</div>
                            <div class="sport">${user.sport}</div>
                        </div>
                    </div>
                    <img src="${post.imageUrl}" alt="Post image by ${user.username}" class="post-image">
                    <div class="post-actions">
                        <button class="action-btn like-btn ${likedByUser ? 'liked' : ''}" data-post-id="${post.id}">
                            ${likedByUser ? '❤️' : '🤍'}
                        </button>
                        <button class="action-btn">💬</button>
                        <button class="action-btn">📤</button>
                    </div>
                    <div class="post-likes">${likesCount} curtidas</div>
                    <div class="post-caption">
                        <span class="caption-username">${user.username}</span>
                        ${post.caption}
                    </div>
                `;
                feedPostsContainer.appendChild(postElement);
            };
        } catch (error) {
            console.error("Error fetching feed:", error);
            feedPostsContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Erro ao carregar o feed.</p>';
        }
    }

    async function handleFeedClick(event: Event) {
        if (!currentUser) return;
        const target = event.target as HTMLElement;
        const likeBtn = target.closest('.like-btn');

        if (likeBtn instanceof HTMLElement) {
            const postId = likeBtn.dataset.postId;
            if (!postId) return;

            const postRef = doc(db, "posts", postId);
            const isLiked = likeBtn.classList.contains('liked');

            // Optimistic UI update
            likeBtn.classList.toggle('liked');
            likeBtn.textContent = isLiked ? '🤍' : '❤️';
            const likesElement = likeBtn.closest('.post')?.querySelector('.post-likes') as HTMLElement;
            if (likesElement) {
                const currentLikes = parseInt(likesElement.textContent || '0');
                likesElement.textContent = `${isLiked ? currentLikes - 1 : currentLikes + 1} curtidas`;
            }

            try {
                if (isLiked) {
                    await updateDoc(postRef, {
                        likedBy: arrayRemove(currentUser.uid)
                    });
                } else {
                    await updateDoc(postRef, {
                        likedBy: arrayUnion(currentUser.uid)
                    });
                }
            } catch (error) {
                console.error("Error updating like:", error);
                // Revert UI on error
                likeBtn.classList.toggle('liked');
                likeBtn.textContent = isLiked ? '❤️' : '🤍';
                 const currentLikes = parseInt(likesElement.textContent || '0');
                 likesElement.textContent = `${isLiked ? currentLikes + 1 : currentLikes - 1} curtidas`;
                alert('Ocorreu um erro ao curtir o post.');
            }
        }
    }

    // --- Stories Functions ---
    function openStory(item: HTMLElement) {
        const username = item.dataset.username;
        if(!username) return;

        const userStories = storiesDB[username];
        if (!userStories || userStories.length === 0) {
             const storyContent = item.dataset.storyContent;
             if (!storyContent) return;
             if (storyViewerUsername) storyViewerUsername.textContent = username;
             storyViewerContent.innerHTML = `<span>${storyContent}</span>`;
        } else {
            const story = userStories[0]; // For now, just show the first story
             if (storyViewerUsername) storyViewerUsername.textContent = username;

            storyViewerContent.innerHTML = '';
            let mediaElement;
            if (story.mediaType === 'video') {
                mediaElement = document.createElement('video');
                mediaElement.autoplay = true;
                mediaElement.loop = true;
                mediaElement.muted = true; // Important for autoplay policy
            } else {
                mediaElement = document.createElement('img');
            }
            mediaElement.src = story.mediaUrl;
            if(story.filter) mediaElement.classList.add(story.filter);

            storyViewerContent.appendChild(mediaElement);

            if(story.music) {
                const musicOverlay = document.createElement('div');
                musicOverlay.className = 'story-music-overlay';
                musicOverlay.innerHTML = `🎵 ${story.music.title} - ${story.music.artist}`;
                storyViewerContent.appendChild(musicOverlay);
            }

            if(story.sticker) {
                 const stickerOverlay = document.createElement('div');
                stickerOverlay.className = 'story-sticker-overlay';
                stickerOverlay.classList.add(story.sticker.animation);
                stickerOverlay.innerHTML = story.sticker.name;
                storyViewerContent.appendChild(stickerOverlay);
            }
        }
        
        const progressBar = storyProgressBar as HTMLElement;
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; 
        progressBar.style.animation = '';
        
        storyViewer.classList.remove('hidden');
        item.classList.add('viewed');
        clearTimeout(storyTimeout);
        storyTimeout = window.setTimeout(closeStory, 5000);
    }

    function closeStory() {
        clearTimeout(storyTimeout);
        storyViewer.classList.add('hidden');
        // Stop any video that might be playing
        const video = storyViewerContent.querySelector('video');
        if(video) video.pause();
    }

    // --- Story Creator Functions ---
    function showStoryCreator() {
        // Reset state
        currentStoryData = {};
        storyPreviewContainer.innerHTML = `
            <label for="storyMediaInput" style="text-align: center; color: white; cursor: pointer;">
                <div style="font-size: 48px;">📷</div>
                <div>Toque para adicionar foto/vídeo</div>
            </label>
        `;
        musicSelectionPanel.classList.add('hidden');
        filterSelectionPanel.classList.add('hidden');
        stickerSelectionPanel.classList.add('hidden');
        storyCreationScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    function closeStoryCreator() {
        storyCreationScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        // Clean up blob URL
        if (currentStoryData.mediaUrl && currentStoryData.mediaUrl.startsWith('blob:')) {
            URL.revokeObjectURL(currentStoryData.mediaUrl);
        }
    }
    
    function handleStoryMediaSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        const mediaUrl = URL.createObjectURL(file);
        currentStoryData.mediaUrl = mediaUrl;

        storyPreviewContainer.innerHTML = '';
        let mediaElement;

        if (file.type.startsWith('video/')) {
            currentStoryData.mediaType = 'video';
            mediaElement = document.createElement('video');
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
        } else {
            currentStoryData.mediaType = 'image';
            mediaElement = document.createElement('img');
        }
        mediaElement.src = mediaUrl;
        mediaElement.id = 'storyPreviewMedia';
        storyPreviewContainer.appendChild(mediaElement);
    }

    function toggleEditorPanel(panel: HTMLElement) {
        const allPanels = [musicSelectionPanel, filterSelectionPanel, stickerSelectionPanel];
        allPanels.forEach(p => {
            if (p !== panel) p.classList.add('hidden');
        });
        panel.classList.toggle('hidden');
    }

    function renderMusicPanel() {
        musicList.innerHTML = musicDB.map(song => `
            <div class="music-item" data-song-id="${song.id}">
                <div class="music-icon">🎵</div>
                <div class="music-details">
                    <div class="music-title">${song.title}</div>
                    <div class="music-artist">${song.artist}</div>
                </div>
            </div>
        `).join('');
    }

    function renderFilterPanel() {
        const filters = [
            { name: 'Nenhum', class: '' },
            { name: 'Vintage', class: 'filter-vintage' },
            { name: 'P&B', class: 'filter-bw' },
            { name: 'Energia', class: 'filter-energy' },
            { name: 'Sépia', class: 'filter-sepia' }
        ];
        filterOptionsContainer.innerHTML = filters.map(f => `
            <div class="filter-option" data-filter-class="${f.class}">
                <div class="filter-preview" style="background-image: url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop');"></div>
                <div class="filter-name">${f.name}</div>
            </div>
        `).join('');
        // Apply filter to previews
        document.querySelectorAll('.filter-option').forEach(el => {
            const preview = el.querySelector('.filter-preview') as HTMLElement;
            const filterClass = el.getAttribute('data-filter-class');
            if (filterClass) preview.classList.add(filterClass);
        });
    }

    function renderStickerPanel() {
        const stickers = [
            { id: 's1', name: '💪', animation: 'sticker-bounce' },
            { id: 's2', name: '🔥', animation: 'sticker-fire' },
            { id: 's3', name: '🏆', animation: '' },
            { id: 's4', name: '💯', animation: '' }
        ];
        stickerOptionsContainer.innerHTML = stickers.map(s => `
            <div class="sticker-option" data-sticker-id="${s.id}">${s.name}</div>
        `).join('');
    }
    
    function applyStoryFilter(filterClass: string) {
        const media = document.getElementById('storyPreviewMedia');
        if (!media) return;
        media.className = ''; // Remove all previous filters
        if (filterClass) media.classList.add(filterClass);
        currentStoryData.filter = filterClass;
    }

    function publishNewStory() {
        if (!currentUser) {
            alert('Você precisa estar logado para publicar um story.');
            return;
        }
        if (!currentStoryData.mediaUrl) {
            alert('Por favor, adicione uma foto ou vídeo.');
            return;
        }

        const newStory = {
            storyId: `story_${currentUser.uid}_${Date.now()}`,
            ...currentStoryData
        };

        if (!storiesDB[currentUser.uid]) {
            storiesDB[currentUser.uid] = [];
        }
        storiesDB[currentUser.uid].unshift(newStory);
        
        alert('Story publicado com sucesso!');
        closeStoryCreator();
    }


    // --- Marketplace Functions ---
    function renderMarketplace() {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        productsDB.forEach(product => {
            const user = usersDB[product.userId];
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.productId;
            productCard.innerHTML = `
                <img src="${product.imageUrl}" class="product-image" alt="${product.name}">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                    <div class="product-location">📍 ${product.location}</div>
                    <div class="product-seller">por @${user?.username || 'desconhecido'}</div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    function showProductDetail(productId: string) {
        const product = productsDB.find(p => p.productId === productId);
        if (!product) return;

        const seller = usersDB[product.userId];
        
        productDetailImage.src = product.imageUrl;
        productDetailName.textContent = product.name;
        productDetailPrice.textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        productDetailSeller.textContent = `@${seller?.username || 'desconhecido'}`;
        productDetailLocation.textContent = product.location;
        productDetailDescription.textContent = product.description;
        buyNowBtn.dataset.productId = product.productId;

        const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
        if(mainHeader) mainHeader.classList.add('hidden');
        showScreen('productDetailScreen');
    }

    function handleBuyNow(event: Event) {
        const button = event.currentTarget as HTMLElement;
        const productId = button.dataset.productId;
        if (!productId) return;

        alert('Compra realizada com sucesso! O vendedor entrará em contato.');
        
        // Remove product from DB and re-render
        productsDB = productsDB.filter(p => p.productId !== productId);
        renderMarketplace();
        
        const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
        if(mainHeader) mainHeader.classList.remove('hidden');
        showScreen('marketplaceScreen');
    }
    
    function publishAd() {
        if (!currentUser) {
            alert('Você precisa estar logado para publicar um anúncio.');
            return;
        }
        const title = productTitleInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const location = productLocationInput.value.trim();
        const description = productDescriptionInput.value.trim();

        if (!title || isNaN(price) || !location || !description) {
            alert('Por favor, preencha todos os campos do anúncio.');
            return;
        }

        const newProduct = {
            productId: `prod${Date.now()}`,
            userId: currentUser.uid,
            name: title,
            price: price,
            location: location,
            // For simplicity, we use a placeholder. A real app would have image upload.
            imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop',
            description: description,
        };

        productsDB.unshift(newProduct);
        renderMarketplace();

        // Reset form
        productTitleInput.value = '';
        productPriceInput.value = '';
        productLocationInput.value = '';
        productDescriptionInput.value = '';

        alert('Anúncio publicado com sucesso!');
        showScreen('marketplaceScreen');
    }


    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    productLocationInput.value = `Lat: ${position.coords.latitude.toFixed(2)}, Lon: ${position.coords.longitude.toFixed(2)}`;
                    alert('Localização obtida com sucesso!');
                },
                (error) => alert(`Erro ao obter localização: ${error.message}`)
            );
        } else {
            alert("Geolocalização não é suportada por este navegador.");
        }
    }

    // --- Profile Functions ---
    function updateProfilePictures() {
        if (!currentUser) return;
        const pic = currentUser.profilePicture;
        const initials = currentUser.initials;
        const placeholder = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="lightgray" width="100" height="100"/><text x="50" y="55" font-family="Arial" font-size="40" text-anchor="middle" dominant-baseline="middle" fill="white">${initials}</text></svg>`;
        if (profileAvatar) profileAvatar.src = pic || placeholder;
        if (editProfileAvatar) editProfileAvatar.src = pic || placeholder;
    }

    function renderProfileScreen() {
        if (!currentUser) return;
        displayName.textContent = currentUser.displayName || '';
        displayBio.textContent = currentUser.bio || '';
        displaySport.textContent = currentUser.sport || '';
        displayWeight.textContent = currentUser.weight ? `${currentUser.weight}kg` : 'Não informado';
        displayCity.textContent = currentUser.city || 'Não informado';
        displayMaritalStatus.textContent = currentUser.maritalStatus || 'Não informado';
        displayHobbies.textContent = currentUser.hobbies || 'Não informado';
        updateProfilePictures();
    }
    
    function handleProfilePictureChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                newProfilePictureDataUrl = result;
                if(editProfileAvatar) editProfileAvatar.src = result; // Show preview
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function showEditProfile() {
        if (!currentUser) return;
        editName.value = currentUser.displayName || '';
        editBio.value = currentUser.bio || '';
        editSport.value = currentUser.sport || '';
        editWeight.value = currentUser.weight || '';
        editCity.value = currentUser.city || '';
        editHobbies.value = currentUser.hobbies || '';
        
        const currentStatus = currentUser.maritalStatus || '';
        const option = Array.from(editMaritalStatus.options).find(opt => opt.text === currentStatus);
        editMaritalStatus.value = option ? option.value : editMaritalStatus.options[0].value;
        
        updateProfilePictures();
        
        const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
        if(mainHeader) mainHeader.classList.add('hidden');
        showScreen('editProfileScreen');
    }

    async function saveProfileChanges() {
        if(!currentUser) return;
        setLoading(saveProfileBtn, true, 'Salvar Alterações');

        let profilePictureUrl = currentUser.profilePicture;

        try {
            // 1. Upload new profile picture if one was selected
            if (newProfilePictureDataUrl) {
                const imageRef = ref(storage, `profilePictures/${currentUser.uid}`);
                const uploadResult = await uploadString(imageRef, newProfilePictureDataUrl, 'data_url');
                profilePictureUrl = await getDownloadURL(uploadResult.ref);
            }

            // 2. Prepare data to update in Firestore
            const dataToUpdate = {
                displayName: editName.value,
                bio: editBio.value,
                sport: editSport.value,
                weight: editWeight.value,
                city: editCity.value,
                hobbies: editHobbies.value,
                maritalStatus: editMaritalStatus.options[editMaritalStatus.selectedIndex].text,
                profilePicture: profilePictureUrl,
            };

            // 3. Update Firestore document
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, dataToUpdate);

            // 4. Update local currentUser object
            currentUser = { ...currentUser, ...dataToUpdate };
            usersDB[currentUser.uid] = currentUser; // Update cache

            // 5. Reset and refresh UI
            newProfilePictureDataUrl = null;
            renderProfileScreen();
            updateProfilePictures();

            const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
            if(mainHeader) mainHeader.classList.remove('hidden');
            showScreen('profileScreen');

        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Ocorreu um erro ao salvar seu perfil. Tente novamente.");
        } finally {
            setLoading(saveProfileBtn, false, 'Salvar Alterações');
        }
    }

    // --- New Post Functions ---
    function handleNewPostImage(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPostImageData = e.target?.result as string;
                if(newPostImagePreview) {
                    newPostImagePreview.src = newPostImageData;
                    newPostImagePreview.classList.remove('hidden');
                }
                if(newPostUploadPlaceholder) newPostUploadPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    async function publishPost() {
        if (!currentUser) {
            alert('Você precisa estar logado para publicar.');
            return;
        }
        if (!newPostImageData || !newPostCaption.value.trim()) {
            alert('Por favor, adicione uma imagem e uma legenda.');
            return;
        }

        setLoading(publishPostBtn, true, 'Publicar');

        try {
            // 1. Upload image to Firebase Storage
            const imageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}.jpg`);
            const uploadTask = await uploadString(imageRef, newPostImageData, 'data_url');
            const downloadURL = await getDownloadURL(uploadTask.ref);

            // 2. Create post document in Firestore
            const newPost = {
                userId: currentUser.uid,
                imageUrl: downloadURL,
                caption: newPostCaption.value,
                likedBy: [],
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "posts"), newPost);
            
            // 3. Reset form and go to feed
            newPostCaption.value = '';
            newPostImageData = null;
            if(newPostImageInput) newPostImageInput.value = '';
            if(newPostImagePreview) newPostImagePreview.classList.add('hidden');
            if(newPostUploadPlaceholder) newPostUploadPlaceholder.classList.remove('hidden');

            showScreen('feedScreen');
            const feedNavBtn = document.querySelector('.nav-btn[data-screen="feedScreen"]');
            if (feedNavBtn) {
                 navButtons.forEach(btn => btn.classList.remove('active'));
                 feedNavBtn.classList.add('active');
            }
            await renderFeed(); // Refresh the feed to show the new post
        } catch (error) {
            console.error("Error publishing post:", error);
            alert('Erro ao publicar o post. Tente novamente.');
        } finally {
            setLoading(publishPostBtn, false, 'Publicar');
        }
    }
    
    // --- Messages Functions ---
    function formatTimestamp(ts: number) {
        const date = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    }

    function renderMessagesList() {
        if (!chatListContainer || !currentUser) return;
        chatListContainer.innerHTML = '';
        const sortedChats = Object.values(chatsDB)
            .filter(chat => chat.participants.includes(currentUser.uid) && !chat.archivedBy.includes(currentUser.uid))
            .sort((a, b) => b.messages.slice(-1)[0].timestamp - a.messages.slice(-1)[0].timestamp);

        sortedChats.forEach(chat => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            let otherUser, chatName, chatAvatar, chatInitials, isOnline;

            if (chat.isGroup) {
                chatName = chat.groupName;
                chatAvatar = chat.groupAvatar;
                chatInitials = chat.groupInitials;
                isOnline = false; // No online status for groups
            } else {
                const otherUserId = chat.participants.find((id: string) => id !== currentUser.uid);
                otherUser = usersDB[otherUserId];
                chatName = otherUser.displayName;
                chatAvatar = otherUser.profilePicture;
                chatInitials = otherUser.initials;
                isOnline = otherUser.isOnline;
            }
            
            let lastMessageText = '';
            switch(lastMessage.type) {
                case 'text': lastMessageText = lastMessage.content; break;
                case 'image': lastMessageText = '📷 Foto'; break;
                case 'audio': lastMessageText = '🎤 Mensagem de áudio'; break;
            }

            const item = document.createElement('div');
            item.className = 'chat-item';
            item.dataset.chatId = chat.chatId;
            item.innerHTML = `
                <div class="chat-avatar">
                    ${chatAvatar ? `<img src="${chatAvatar}" class="chat-avatar-img" alt="${chatName}">` : `<div class="avatar">${chatInitials}</div>`}
                    ${isOnline ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="chat-details">
                    <div class="chat-name">${chatName}</div>
                    <div class="chat-last-message">${lastMessageText}</div>
                </div>
                <div class="chat-info">
                    <div class="chat-time">${formatTimestamp(lastMessage.timestamp)}</div>
                    ${chat.mutedBy.includes(currentUser.uid) ? '<div class="chat-mute-icon">🔇</div>' : ''}
                </div>
            `;
            chatListContainer.appendChild(item);
        });
    }

    function showChat(chatId: string) {
        currentChatId = chatId;
        const chat = chatsDB[chatId];
        if (!chat || !currentUser) return;

        let name, avatar, initials, status;
        if (chat.isGroup) {
            name = chat.groupName;
            avatar = chat.groupAvatar;
            initials = chat.groupInitials;
            status = `${chat.participants.length} membros`;
        } else {
            const otherUserId = chat.participants.find((id: string) => id !== currentUser.uid);
            const otherUser = usersDB[otherUserId];
            name = otherUser.displayName;
            avatar = otherUser.profilePicture;
            initials = otherUser.initials;
            status = otherUser.isOnline ? 'Online' : `Visto por último ${formatTimestamp(otherUser.lastSeen)}`;
        }
        
        chatHeaderName.textContent = name;
        chatHeaderStatus.textContent = status;
        if (avatar) {
            chatHeaderAvatar.src = avatar;
            chatHeaderAvatar.classList.remove('hidden');
            chatHeaderInitials.classList.add('hidden');
        } else {
            chatHeaderInitials.textContent = initials;
            chatHeaderInitials.classList.remove('hidden');
            chatHeaderAvatar.classList.add('hidden');
        }

        renderChatMessages(chatId);
        const mainHeader = document.querySelector('#mainApp > .header') as HTMLElement;
        if(mainHeader) mainHeader.classList.add('hidden');
        showScreen('chatScreen');
    }

    function renderChatMessages(chatId: string) {
        if (!currentUser) return;
        messageContainer.innerHTML = '';
        const chat = chatsDB[chatId