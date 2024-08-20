class HomeButton {
    constructor(scene) {
        this.scene = scene;
        this.createHomeButton();
        this.createModal();
    }

    preload() {
        // Home Button
        this.load.image('home-button', 'assets/home-button.png');
        this.load.image('modal-text', 'assets/modal-text.png');
        this.load.image('home-yes', 'assets/button-yes.png');
        this.load.image('home-no', 'assets/button-no.png');
        this.load.image('modal-close', 'assets/modal-close.png');

        console.log('Images loaded');
    }

    createHomeButton() {
        this.homeButton = this.scene.add.image(10, 10, 'home-button');
        const homeButtonWidth = Math.min(this.scene.scale.width, this.scene.scale.height, 1000) / 12;
        const homeButtonHeight = this.homeButton.height * (homeButtonWidth / this.homeButton.width);
        
        this.homeButton.setDisplaySize(homeButtonWidth, homeButtonHeight)
            .setOrigin(0,0)
            .setInteractive() // 画像をインタラクティブにする
            .setDepth(10)
            .on('pointerdown', () => {
                this.showModal();
            });
    }

    createModal() {
        // Create a semi-transparent black background that covers the entire screen
        this.modalBackground = this.scene.add.graphics()
            .fillStyle(0x000000, 0.5) // Black with 50% opacity
            .fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
        this.modalBackground.setInteractive(); // Make the background interactive
        this.modalBackground.setVisible(false); // Initially hidden
        this.modalBackground.setDepth(11); // 背景の深度

        // Create a container for the modal content
        this.modal = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);

        // Adjust the modal size to fit the screen with some padding
        const modalWidth = Math.min(this.scene.scale.width * 0.8, 800);
        const modalHeight = Math.min(this.scene.scale.height * 0.6, 600);
        const borderRadius = modalWidth / 16; // 1rem in pixels

        this.modalBackgroundRect = this.scene.add.graphics();
        this.modalBackgroundRect.fillStyle(0xffffff, 1);
        this.modalBackgroundRect.fillRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, borderRadius);
        
        // ストロークを追加（淡い緑色）
        this.modalBackgroundRect.lineStyle(20, 0x94E7FC); // 4ピクセルの太さで淡い緑色 (LightGreen)
        this.modalBackgroundRect.strokeRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, borderRadius);

        this.modalBackgroundRect.setDepth(12); // モーダルの深度
        this.modal.add(this.modalBackgroundRect);

        // Create the modal content container
        this.modalContent = this.scene.add.container();
        this.modalContent.setPosition(0, 0); // Center modalContent
        this.modalContent.setDepth(13); // モーダル内容の深度
        this.modal.add(this.modalContent);

        // Add the "ホームに戻りますか？" text as an image
        this.modalText = this.scene.add.image(0, -modalHeight * 0.2, 'modal-text') // 'modal-text' is the key for your text image
            .setOrigin(0.5, 0.5)
            .setScale(modalWidth / this.scene.textures.get('modal-text').getSourceImage().width * 0.7)
            .setDepth(14); // モーダルテキストの深度

        this.modalContent.add(this.modalText);

        // Calculate button size as a percentage of modal width
        const buttonSize = modalWidth * 0.35;

        // Load and add "はい" button
        this.yesButton = this.scene.add.image(-modalWidth * 0.2, modalHeight * 0.2, 'home-yes')
            .setInteractive()
            .setScale(buttonSize / this.scene.textures.get('home-yes').getSourceImage().width)
            .setDepth(14) // ボタンの深度
            .on('pointerdown', () => {
                window.location.href = 'https://pikopo.com/';
            });
        this.modalContent.add(this.yesButton);

        // Load and add "いいえ" button
        this.noButton = this.scene.add.image(modalWidth * 0.2, modalHeight * 0.2, 'home-no')
            .setInteractive()
            .setScale(buttonSize / this.scene.textures.get('home-no').getSourceImage().width)
            .setDepth(14) // ボタンの深度
            .on('pointerdown', () => {
                this.hideModal();
            });
        this.modalContent.add(this.noButton);

        // Add close button
        this.closeButton = this.scene.add.image(modalWidth / 2 - 10, -modalHeight / 2 + 10, 'modal-close')
            .setInteractive()
            .setScale(0.8)
            .setDepth(14) // 閉じるボタンの深度
            .on('pointerdown', () => {
                this.hideModal();
            });
        this.modal.add(this.closeButton);

        this.modal.setVisible(false);
        this.modal.setDepth(12); // モーダルの深度全体

        // Ensure the modal and background are interactive
        this.modal.setInteractive();
        this.modalBackground.setInteractive();

        // Add event listener for clicks on the modal background
        this.modalBackground.on('pointerdown', () => {
            this.hideModal();
        });

        // Prevent click events from passing through the modal
        this.modal.on('pointerdown', (pointer) => {
            pointer.stopPropagation();
        });
    }

    showModal() {
        this.modal.setVisible(true);
        this.modalBackground.setVisible(true); // Show the black background
    }

    hideModal() {
        this.modal.setVisible(false);
        this.modalBackground.setVisible(false); // Hide the black background
    }
}
