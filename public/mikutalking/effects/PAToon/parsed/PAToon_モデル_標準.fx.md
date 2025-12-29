# PAToon_モデル_標準.fx

## 宏定义 (Defines)

| 名称 | 值 | 状态 | 说明 |
|------|-----|------|------|
| ADDMATERIALCOLOR | - | 启用 | - |
| ADDTOONCOLOR | - | 启用 | - |
| FLAGCOLOROFF | - | 启用 | - |
| USE_LOCALSHADOW | - | 启用 | - |
| LS_ExecKey | 0.39 | 禁用 | - |
| USE_EXCELLENTSHADOW | - | 启用 | - |
| USE_HGSHADOW | - | 启用 | - |
| HANDLE_EDGE | - | 禁用 | - |
| MODEL_TOON | - | 启用 | - |
| PATOONCONTROLLER | "PAToon�R���g���[���[.pmx" | 启用 | - |
| USE_ROUNDNORMAL | - | 启用 | - |
| USE_SHADOWBIAS_TOONTEX | - | 禁用 | ���F�a�̏����_��T�ʂ��P�ɂ��� |
| USE_SHADOWBIAS_SUBTEX | - | 禁用 | ���F�a�̏����_��U�ʂ��P�ɂ��� |
| USE_SHADOWBIASMAP | "ShadowBiasMap.png" | 禁用 | - |
| USE_NORMALMAP_TOONTEX | - | 禁用 | ���F�a�̏����_��T�ʂ��Q�ɂ��� |
| USE_NORMALMAP_SUBTEX | - | 禁用 | ���F�a�̏����_��U�ʂ��Q�ɂ��� |
| USE_NORMALMAP | "NormalMap.png" | 禁用 | - |
| BLENDDIFFUSE0TEXTURE | "Tex/DiffuseHue.png" | 启用 | - |
| BLENDDIFFUSE0TEXTURE_X | 256 | 启用 | - |
| BLENDDIFFUSE0TEXTURE_Y | 360 | 启用 | - |
| BLENDDIFFUSE1TEXTURE | "Tex/DiffuseMulBySat.png" | 启用 | - |
| BLENDDIFFUSE1TEXTURE_X | 256 | 启用 | - |
| BLENDDIFFUSE1TEXTURE_Y | 256 | 启用 | - |
| BLENDDIFFUSE2TEXTURE | "Tex/DiffuseMulc2.png" | 启用 | - |
| BLENDDIFFUSE2TEXTURE_X | 256 | 启用 | - |
| BLENDDIFFUSE2TEXTURE_Y | 256 | 启用 | - |
| BLENDDIFFUSE3TEXTURE | "Tex/DiffuseAdd.png" | 启用 | - |
| BLENDDIFFUSE3TEXTURE_X | 256 | 启用 | - |
| BLENDDIFFUSE3TEXTURE_Y | 256 | 启用 | - |
| BLENDSPECULAR0TEXTURE | "Tex/SpecularMul.png" | 禁用 | - |
| BLENDSPECULAR0TEXTURE_X | 256 | 禁用 | - |
| BLENDSPECULAR0TEXTURE_Y | 256 | 禁用 | - |
| BLENDSPECULAR1TEXTURE | - | 启用 | - |
| BLENDSPECULAR1TEXTURE_X | 256 | 启用 | - |
| BLENDSPECULAR1TEXTURE_Y | 256 | 启用 | - |
| BLENDADDSPHERE0TEXTURE | - | 启用 | - |
| BLENDADDSPHERE0TEXTURE_X | 256 | 启用 | - |
| BLENDADDSPHERE0TEXTURE_Y | 256 | 启用 | - |
| BLENDADDSPHERE1TEXTURE | "Tex/AddSphereRepl.png" | 禁用 | - |
| BLENDADDSPHERE1TEXTURE_X | 256 | 禁用 | - |
| BLENDADDSPHERE1TEXTURE_Y | 1 | 禁用 | - |
| BLENDADDSPHERE2TEXTURE | - | 禁用 | - |
| BLENDADDSPHERE2TEXTURE_X | 256 | 禁用 | - |
| BLENDADDSPHERE2TEXTURE_Y | 256 | 禁用 | - |
| BLENDEDGE0TEXTURE | - | 启用 | - |
| BLENDEDGE0TEXTURE_X | 256 | 启用 | - |
| BLENDEDGE0TEXTURE_Y | 256 | 启用 | - |
| SHADE_TOONLESS | - | 禁用 | - |
| AMBIENT_AS_BASE | - | 禁用 | - |
| AMBIENT_TOON_AS_BASE | - | 禁用 | - |
| BLENDDIFFUSESHADOWTEXTURE | "Tex/DiffuseShadowMask.png" | 禁用 | - |
| BLENDDIFFUSESHADOWTEXTURE_X | 256 | 禁用 | - |
| BLENDDIFFUSESHADOWTEXTURE_Y | 256 | 禁用 | - |
| BLENDDIFFUSEMATERIALTEXTURE | "Tex/DiffuseMaterialMask.png" | 禁用 | - |
| BLENDDIFFUSEMATERIALTEXTURE_X | 256 | 禁用 | - |
| BLENDDIFFUSEMATERIALTEXTURE_Y | 256 | 禁用 | - |
| LS_InitDirection | float3(-0.5, -0.1, 1.0) | 启用 | - |
| LS_ShadowMapBuffSize | 2048 | 启用 | - |
| LS_ShadowMapAreaSize | 3.5 | 启用 | - |
| LS_ShadowMapDepthLength | 20.0 | 启用 | - |
| LS_InitBlurPower | 0 | 启用 | - |
| LS_LightSyncShade | 0 | 启用 | - |
| LS_LightSyncShadow | 0 | 启用 | - |
| LS_LightSyncDensity | 0 | 启用 | - |
| LS_UseSoftShadow | 1 | 启用 | - |

## 纹理 (Textures)

| 名称 | 路径 | 尺寸 | 用途 |
|------|------|------|------|
| BLENDDIFFUSE0TEXTURE | Tex/DiffuseHue.png | 256x360 | diffuse0 |
| BLENDDIFFUSE1TEXTURE | Tex/DiffuseMulBySat.png | 256x256 | diffuse1 |
| BLENDDIFFUSE2TEXTURE | Tex/DiffuseMulc2.png | 256x256 | diffuse2 |
| BLENDDIFFUSE3TEXTURE | Tex/DiffuseAdd.png | 256x256 | diffuse3 |

## 参数 (Parameters)

| 名称 | 类型 | 语义 | 默认值 |
|------|------|------|--------|
| AddMaterialRgb | float3 | - | float3(0.00, 0.00, 0.00) |
| AddMaterialHsv | float3 | - | float3(0.00, 0.00, 0.00) |
| AddToonRgb | float3 | - | float3(0.00, 0.00, 0.00) |
| AddToonHsv | float3 | - | float3(0.00, 0.00, 0.00) |
| HandleEdgeSettingON | float3 | - | float3(1, 1, 1) |
| SetShadingBiasPower | float | - | 1 |
| UIMin | float | - | 0 |
| UIMax | float | - | 10 |

## 包含文件 (Includes)

- PACore.hlsl
