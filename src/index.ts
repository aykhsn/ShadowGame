import Phaser from 'phaser';

class StartScene extends Phaser.Scene {
    constructor() {
        super('start-scene');
    }

    preload() {
        this.load.image('startButton', 'assets/button-start.png'); // スタートボタンの画像を読み込む
    }

    create() {
        // スタートボタンを配置
        const button = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton');
        button.setInteractive();

        // スタートボタンがクリックされたときにShadowGameシーンを開始
        button.on('pointerdown', () => {
            this.scene.start('shadow-game');
        });

        // ボタンのサイズを調整
        const buttonWidth = Math.min(this.scale.width, this.scale.height) / 2;
        button.setDisplaySize(buttonWidth, button.height * (buttonWidth / button.width));
    }
}

class ShadowGame extends Phaser.Scene {
    private animals: Phaser.GameObjects.Image[] = [];
    private shadow: Phaser.GameObjects.Image | null = null;
    private correctAnimalKey: string = '';
    private currentDepth: number = 0; // 現在の最大深度を追跡
    private isAnimating: boolean = false; // アニメーション中かどうかのフラグ

    private correctSound: Phaser.Sound.BaseSound | null = null;
    private seikaiVoice: Phaser.Sound.BaseSound | null = null;
    private yattaneVoice: Phaser.Sound.BaseSound | null = null;
    private wrongSound: Phaser.Sound.BaseSound | null = null;
    private dropSound: Phaser.Sound.BaseSound | null = null;
    private cheersSound: Phaser.Sound.BaseSound | null = null;
    private gatagataSound: Phaser.Sound.BaseSound | null = null;


    private animalKeys = [
        'bear', 'cat', 'cow', 'crocodile', 'dog', 'elephant', 'fox',
        'giraffe', 'hippo', 'lion', 'monkey', 'panda',
        'pig', 'rabbit', 'zebra'
    ];

    constructor() {
        super('shadow-game');
    }

    preload() {
        this.animalKeys.forEach(key => {
            this.load.image(`animal_${key}`, `assets/animal_${key}.png`);
            this.load.image(`shadow_${key}`, `assets/shadow_${key}.png`);
        });
        this.load.image('tree', 'assets/tree.png'); // 木の画像を読み込む
        this.load.image('grass', 'assets/grass.png'); // 草の画像を読み込む
        this.load.audio('correctSound', 'assets/quiz-pinpon.mp3'); // 正解の音を読み込む
        this.load.audio('seikaiVoice', 'assets/voice-seikai.mp3'); // 正解の音声を読み込む
        this.load.audio('yattaneVoice', 'assets/voice-yattane.mp3'); // やったねの音声を読み込む
        this.load.audio('wrongSound', 'assets/quiz-bu.mp3'); // 不正解の音を読み込む
        this.load.audio('dropSound', 'assets/papa.mp3');
        this.load.audio('cheersSound', 'assets/cheers.mp3');
        this.load.audio('gatagataSound', 'assets/reminiscence.mp3');
    }

    create() {
        // サウンドオブジェクトを作成
        this.correctSound = this.sound.add('correctSound');
        this.seikaiVoice = this.sound.add('seikaiVoice');
        this.yattaneVoice = this.sound.add('yattaneVoice');
        this.wrongSound = this.sound.add('wrongSound');
        this.dropSound = this.sound.add('dropSound');
        this.cheersSound = this.sound.add('cheersSound');
        this.gatagataSound = this.sound.add('gatagataSound');

        // 画面の上半分を水色、下半分を緑色に設定
        const upperBackground = this.add.rectangle(0, 0, this.scale.width, this.scale.height / 3, 0x87CEEB).setOrigin(0);
        const lowerBackground = this.add.rectangle(0, this.scale.height / 3, this.scale.width, this.scale.height * 2 / 3, 0x3bae39).setOrigin(0);

        // 背景を最背面に設定
        upperBackground.setDepth(-3);
        lowerBackground.setDepth(-3);

        // 木を配置
        const treeHeight = this.scale.height / 5;
        const treeYPosition = this.scale.height * 1.1 / 3; // 背景の緑色の端にぴったり重なる位置
        const treeLeft = this.add.image(0, treeYPosition, 'tree').setOrigin(0, 1);
        const treeRight = this.add.image(this.scale.width, treeYPosition, 'tree').setOrigin(1, 1);

        // 木の高さを設定
        treeLeft.setDisplaySize(treeLeft.width * (treeHeight / treeLeft.height), treeHeight);
        treeRight.setDisplaySize(treeRight.width * (treeHeight / treeRight.height), treeHeight);

        treeLeft.setDepth(-2);
        treeRight.setDepth(-2);

        // 草を配置
        const grassPositions = [
            { x: this.scale.width * 0.1, y: this.scale.height * 2.5 / 6 },
            { x: this.scale.width * 0.85, y: this.scale.height * 2.3 / 6 },
            { x: this.scale.width * 0.2, y: this.scale.height * 3.3 / 6 },
            { x: this.scale.width * 0.8, y: this.scale.height * 3.4 / 6 },
            { x: this.scale.width * 0.15, y: this.scale.height * 5.4 / 6 },
            { x: this.scale.width * 0.5, y: this.scale.height * 5.2 / 6 },
            { x: this.scale.width * 0.9, y: this.scale.height * 5.4 / 6 },
        ];

        grassPositions.forEach(position => {
            const grass = this.add.image(position.x, position.y, 'grass');
            const grassHeight = this.scale.height / 15;
            grass.setDisplaySize(grass.width * (grassHeight / grass.height), grassHeight);
            grass.setDepth(-2);
        });

        // テキストを追加
        const textStyle = { fontSize: Math.min(this.scale.width, this.scale.height) / 12, color: '#0d6c0c', fontFamily: '"M PLUS 1p", sans-serif' };
        const questionText = this.add.text(this.scale.width / 2, 30, 'だれのかげかな？', textStyle);
        questionText.setOrigin(0.5, 0); // テキストを中央揃え

        this.startNewRound();
    }

    startNewRound() {
        // 既存のイベントリスナーをクリア
        this.input.off('drag');
        this.input.off('dragstart');
        this.input.off('dragend');

        // 前の動物と影を削除
        this.animals.forEach(animal => {
            if (animal) {
                animal.destroy();
            }
        });
        this.animals = []; // 削除後にクリア

        if (this.shadow) {
            this.shadow.destroy();
            this.shadow = null;
        }

        // 16種類の動物からランダムに3匹選ぶ
        const selectedAnimals = Phaser.Utils.Array.Shuffle(this.animalKeys).slice(0, 3);
        this.correctAnimalKey = selectedAnimals[Phaser.Math.Between(0, 2)];

        const isLandscape = this.scale.width > this.scale.height;
        const animalWidth = isLandscape ? this.scale.width * 0.8 / 3 : this.scale.width * 0.8 / 2;

        const positionsX = isLandscape
            ? [this.scale.width / 2, this.scale.width / 6, (this.scale.width * 5) / 6]
            : [this.scale.width / 2, this.scale.width * 1 / 4, this.scale.width * 3 / 4];

        const positionsY = isLandscape
            ? [this.scale.height * 3 / 4, this.scale.height * 3 / 4, this.scale.height * 3 / 4]
            : [this.scale.height * 4.5 / 8, this.scale.height * 6 / 8, this.scale.height * 6 / 8];

        // 選ばれた動物を配置
        this.animals = selectedAnimals.map((animalKey, index) => {
            const animal = this.add.image(this.scale.width + animalWidth, positionsY[index], `animal_${animalKey}`).setInteractive({ draggable: true });
            animal.setDisplaySize(animalWidth, animal.height * (animalWidth / animal.width));
            animal.setDepth(index);
            this.input.setDraggable(animal); // ドラッグ可能にする

            // 動物の初期位置を記憶
            (animal as any).initialX = positionsX[index];
            (animal as any).initialY = positionsY[index];

            this.tweens.add({
                targets: animal,
                x: positionsX[index],
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    animal.setInteractive(); // インタラクティブ性を再設定
                }
            });

            return animal;
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
        
        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            // ドラッグを開始したときに、動物を最前面に移動
            if (!this.isAnimating) {
                this.currentDepth += 1; // 深度を増加
                gameObject.setDepth(this.currentDepth); // 現在の最大深度を設定
            }
        });
        
        this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (!this.isAnimating) {
                if (this.checkOverlap(gameObject, this.shadow!)) {
                    this.handleAnimalDrop(gameObject);
                } else {
                    // ドラッグが終了しても影と重なっていなかった場合、元の位置に戻す
                    this.tweens.add({
                        targets: gameObject,
                        x: (gameObject as any).initialX,
                        y: (gameObject as any).initialY,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            } else {
                // アニメーション中であれば、元の位置に戻す
                this.tweens.add({
                    targets: gameObject,
                    x: (gameObject as any).initialX,
                    y: (gameObject as any).initialY,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });

        // 正解の影を配置
        this.shadow = this.add.image(this.scale.width / 2, this.scale.height * 1.2 / 4, `shadow_${this.correctAnimalKey}`);
        this.shadow.setDisplaySize(animalWidth, this.shadow.height * (animalWidth / this.shadow.width));
        this.shadow.setDepth(-1);
        this.isAnimating = false; // アニメーション中でない状態にリセット
    }

    handleAnimalDrop(droppedAnimal: Phaser.GameObjects.Image) {
        this.isAnimating = true; // アニメーション中にフラグを立てる
        if (this.checkOverlap(droppedAnimal, this.shadow!)) {
            this.dropSound!.play();
            // ドロップ時に影と重なっていた場合、ぴったりと影の位置に合わせる
            this.tweens.add({
                targets: droppedAnimal,
                x: this.shadow!.x,
                y: this.shadow!.y,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.gatagataSound!.play();

                    // ぴったり重なった後にガタガタと上下に揺れる
                    this.tweens.add({
                        targets: droppedAnimal,
                        y: `+=10`, // 上下に10px揺れる
                        yoyo: true,
                        repeat: 6, // 3回揺れる
                        duration: 120,
                        ease: 'Sine.easeInOut',
                        onComplete: () => {
                            if (droppedAnimal.texture.key === `animal_${this.correctAnimalKey}`) {
                                // 正解の場合の処理
                                this.time.delayedCall(1200, () => {
                                    this.correctSound!.play();
                                });
    
                                this.time.delayedCall(2100, () => {
                                    this.yattaneVoice!.play();
                                });
    
                                this.time.delayedCall(2900, () => {
                                    this.seikaiVoice!.play();
                                });
    
                                droppedAnimal.disableInteractive();  // 正解の動物のインタラクティブ性を無効にする
                                
                                this.tweens.add({
                                    targets: this.shadow,
                                    alpha: 0,
                                    duration: 400,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        this.shadow!.destroy();  // フェードアウト後に削除
                                    }
                                });

                                // 中央に移動
                                this.time.delayedCall(1200, () => {
                                    // 不正解の動物をフェードアウトして消す
                                    this.animals.forEach(animal => {
                                        if (animal !== droppedAnimal) {
                                            this.tweens.add({
                                                targets: animal,
                                                alpha: 0,
                                                duration: 800,
                                                ease: 'Power2',
                                                onComplete: () => {
                                                    animal.destroy();  // フェードアウト後に削除
                                                }
                                            });
                                        }
                                    });

                                    this.tweens.add({
                                        targets: droppedAnimal,
                                        x: this.scale.width / 2,
                                        y: this.scale.height / 2,
                                        duration: 800,
                                        ease: 'Power2',
                                        onComplete: () => {
                                            // 1秒後に左へ移動
                                            this.time.delayedCall(1000, () => {
                                                this.cheersSound!.play();

                                                this.tweens.add({
                                                    targets: droppedAnimal,
                                                    x: -droppedAnimal.width,  // 画面の左外へ移動
                                                    yoyo: false, // 左右には揺れないようにする
                                                    duration: 1500,
                                                    ease: 'Sine.easeInOut',
                                                    onComplete: () => {
                                                        droppedAnimal.destroy();  // 完全に消す
                                                    }
                                                });
        
                                                // 同じ動物を3匹右側から生成して左へ移動させる
                                                for (let i = 0; i < 5; i++) {
                                                    const cloneAnimal = this.add.image(this.scale.width + droppedAnimal.width, this.scale.height / 3 + Phaser.Math.Between(0, 4) * (this.scale.height / 8), droppedAnimal.texture.key);
                                                    cloneAnimal.setDisplaySize(droppedAnimal.width, droppedAnimal.height);
                                                    cloneAnimal.setDepth(droppedAnimal.depth);
        
                                                    this.tweens.add({
                                                        targets: cloneAnimal,
                                                        x: -cloneAnimal.width,  // 左外へ移動
                                                        duration: 1500,
                                                        delay: i * 240,  // 順番に動き始めるように遅延を追加
                                                        ease: 'Sine.easeInOut',
                                                        onComplete: () => {
                                                            cloneAnimal.destroy();  // 完全に消す
                                                        }
                                                    });
                                                }
        
                                                // 新しいラウンドをスタート
                                                this.time.delayedCall(3000, () => {
                                                    this.isAnimating = false; // アニメーションが終了したらフラグをリセット
                                                    this.startNewRound();
                                                });
                                            });
                                        }
                                    });
                                });
                            } else {
                                // 不正解の場合の処理
                                this.time.delayedCall(1200, () => {
                                    this.wrongSound!.play(); // 不正解の音を再生

                                    this.tweens.add({
                                        targets: droppedAnimal,
                                        alpha: 0,
                                        duration: 800,
                                        ease: 'Power2',
                                        onComplete: () => {
                                            droppedAnimal.destroy();  // 完全に消す
                                            this.isAnimating = false; // アニメーションが終了したらフラグをリセット
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            });
        }
    }           

    checkOverlap(spriteA: Phaser.GameObjects.Image, spriteB: Phaser.GameObjects.Image) {
        const boundsA = spriteA.getBounds();
        const boundsB = spriteB.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scene: [StartScene, ShadowGame],
    backgroundColor: '#87CEEB',  // 背景色を水色に設定
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    }
};

const game = new Phaser.Game(config);
