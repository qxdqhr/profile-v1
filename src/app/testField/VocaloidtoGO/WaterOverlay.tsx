import { Application, Texture, TilingSprite } from 'pixi.js';

// Reference to the water overlay.
let overlay: TilingSprite;

export function WaterOverlay(app: Application) {
    // Create a water texture object.
    const texture = Texture.from('overlay');

    // Create a tiling sprite with the water texture and specify the dimensions.
    overlay = new TilingSprite({
        texture,
        width: app.screen.width,
        height: app.screen.height,
    });

    // Add the overlay to the stage.
    app.stage.addChild(overlay);
}

export function animateWaterOverlay(app: Application, time: { deltaTime: number }   ) {
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    // Animate the overlay.
    overlay.tilePosition.x -= delta;
    overlay.tilePosition.y -= delta;
}
