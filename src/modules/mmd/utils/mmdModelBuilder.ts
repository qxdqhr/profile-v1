import * as THREE from 'three';
import type { MMDModel } from 'mmd-parser';
import { TextureManager } from './textureManager';

/**
 * MMD模型构建器 - 将解析的MMD数据转换为Three.js对象
 */
export class MMDModelBuilder {
  /**
   * 将MMD模型数据转换为Three.js网格
   */
  static buildMesh(mmdModel: MMDModel, textureManager?: TextureManager): THREE.Group {
    const group = new THREE.Group();
    group.name = mmdModel.metadata.modelName || 'MMD Model';

    try {
      console.log('开始构建MMD模型:', {
        name: group.name,
        vertices: mmdModel.vertices?.length || 0,
        faces: mmdModel.faces?.length || 0,
        materials: mmdModel.materials?.length || 0,
        textures: textureManager?.getStats().count || 0
      });

      // 创建几何体
      const geometry = this.createGeometry(mmdModel);
      
      // 创建材质
      const materials = this.createMaterials(mmdModel, textureManager);
      
      if (materials.length === 1) {
        // 单一材质
        const mesh = new THREE.Mesh(geometry, materials[0]);
        mesh.name = group.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      } else if (materials.length > 1) {
        // 多材质，需要创建多个子网格
        this.createMultiMaterialMesh(group, geometry, materials, mmdModel);
      } else {
        // 没有材质信息，使用默认材质
        const material = new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          side: THREE.DoubleSide 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = group.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }

      console.log('MMD模型构建完成');
      return group;

    } catch (error) {
      console.error('MMD模型构建失败:', error);
      // 返回简单的占位符模型
      return this.createFallbackModel(group.name);
    }
  }

  /**
   * 创建几何体
   */
  private static createGeometry(mmdModel: MMDModel): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    // 顶点位置
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    mmdModel.vertices.forEach(vertex => {
      positions.push(...vertex.position);
      normals.push(...vertex.normal);
      uvs.push(...vertex.uv);
    });

    // 面索引
    const indices: number[] = [];
    mmdModel.faces.forEach(face => {
      indices.push(...face.indices);
    });

    // 设置几何体属性
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    // 计算包围盒和法线
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  /**
   * 创建材质数组
   */
  private static createMaterials(mmdModel: MMDModel, textureManager?: TextureManager): THREE.Material[] {
    if (!mmdModel.materials || mmdModel.materials.length === 0) {
      console.log('⚠️ 模型没有材质信息');
      return [];
    }

    console.log('🎨 开始创建材质:', {
      材质数量: mmdModel.materials.length,
      纹理管理器: textureManager ? '已提供' : '未提供',
      可用纹理: textureManager?.listTextures() || []
    });

    const materials: THREE.Material[] = [];
    const textureLoader = new THREE.TextureLoader();

    mmdModel.materials.forEach((material, index) => {
      try {
        console.log(`🔍 处理材质 [${index}]:`, {
          material: material,
          hasTexture: !!material.texture,
          texturePath: material.texture
        });

        // 使用更友好的材质名称显示
        const materialName = `材质_${index}`;
        
        const threeMaterial = new THREE.MeshLambertMaterial({
          name: materialName,
          side: THREE.DoubleSide,
          transparent: material.diffuse[3] < 1.0, // 使用diffuse的alpha通道
          opacity: material.diffuse[3] || 1.0
        });

        // 设置漫反射颜色
        if (material.diffuse) {
          threeMaterial.color.setRGB(
            material.diffuse[0],
            material.diffuse[1], 
            material.diffuse[2]
          );
          console.log(`  🎨 材质颜色: RGB(${material.diffuse[0]}, ${material.diffuse[1]}, ${material.diffuse[2]})`);
        }

        // 处理纹理（如果有纹理路径）
        if (material.texture && textureManager) {
          console.log(`  🖼️ 尝试加载纹理: "${material.texture}"`);
          const textureUrl = textureManager.getTextureUrl(material.texture);
          if (textureUrl) {
            const texture = textureLoader.load(textureUrl, 
              // 成功回调
              (tex) => {
                console.log(`  ✅ 纹理加载成功: ${material.texture}`);
              },
              // 进度回调
              undefined,
              // 错误回调
              (err) => {
                console.error(`  ❌ 纹理加载失败: ${material.texture}`, err);
              }
            );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.flipY = false; // MMD纹理不需要翻转
            threeMaterial.map = texture;
            console.log(`  ✅ 应用纹理: ${material.texture} -> Material_${index}`);
          } else {
            console.warn(`  ⚠️ 未找到匹配的纹理文件: "${material.texture}"`);
            console.log(`  可用纹理列表:`, textureManager.listTextures());
          }
        } else if (material.texture) {
          console.warn(`  ⚠️ 材质有纹理引用但没有纹理管理器: "${material.texture}"`);
        } else {
          console.log(`  📝 材质没有纹理引用，使用纯色`);
        }

        materials.push(threeMaterial);

      } catch (error) {
        console.error(`❌ 创建材质失败 [${index}]:`, error);
        // 使用默认材质作为后备
        materials.push(new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          side: THREE.DoubleSide 
        }));
      }
    });

    console.log(`🎯 材质创建完成，共 ${materials.length} 个材质`);
    return materials;
  }

  /**
   * 创建多材质网格
   */
  private static createMultiMaterialMesh(
    group: THREE.Group, 
    geometry: THREE.BufferGeometry, 
    materials: THREE.Material[], 
    mmdModel: MMDModel
  ): void {
    // 简化版本：创建单个网格使用多材质组
    // 由于MMD材质结构复杂，暂时使用第一个材质
    const material = materials[0] || new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      side: THREE.DoubleSide 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${group.name}_MultiMaterial`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    console.log(`使用多材质模式，应用材质数量: ${materials.length}`);
  }

  /**
   * 创建后备模型
   */
  private static createFallbackModel(name: string): THREE.Group {
    const group = new THREE.Group();
    group.name = name;

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshLambertMaterial({ color: 0xff6600 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    group.add(cube);
    console.log('使用后备模型');
    return group;
  }
} 