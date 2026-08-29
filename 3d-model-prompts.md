# 3D 模型生成提示词 v2（hongyuguo.com 哈苏式黑色背景 hero）

> 目标：**全身人形机器人**，光滑高反光黑色质感、有设计感；作为页面背景固定，
> 随鼠标滑动/页面滚动 3D 旋转做动作，像哈苏 X2D II 100C 页面里的相机一样
> 半隐半现在纯黑背景中。
>
> 风格参考：Hasselblad X2D II 100C 产品页（纯黑背景、强边缘光、极简）+ CG 网站
> （ArtStation / Sketchfab 上高端硬表面机器人设计）。
>
> 生成工具：Meshy / Tripo3D / Luma Genie。导出 **GLB** 放到 `assets/models/robot.glb`。

## 一、主提示词（英文，text-to-3D 直接重新生成模型）

```
Full-body humanoid robot standing in a neutral relaxed A-pose, centered
full-body view, premium glossy black design, inspired by high-end hard-surface
robot designs on ArtStation and Sketchfab, studio product photography style on
a pure black background with strong rim lighting and bright reflections, PBR
materials, high gloss, game asset quality, no text, no logo, no background.
Material per body part:
- Head shell: transparent smoked glass, semi-transparent, revealing mechanical
  structure inside the head
- Face visor: glossy black glass with subtle mirror reflections
- Neck and collar: piano-black lacquered metal, wet-look reflections
- Chest plate: high-gloss piano black with two small carbon fiber inserts and
  a transparent glass hatch in the center revealing glowing inner machinery
- Shoulder armor: polished chrome metal, strong mirror reflections
- Upper and lower arm armor: piano-black lacquered metal shell panels with
  crisp edge highlights; a small transparent glass window on each forearm
- Elbow, knee and finger joints: brushed dark metal mechanical parts, visible
  bolts and pistons
- Hands: polished dark chrome, precise specular details
- Waist and abdomen: glossy black ceramic with thin dark gray panel lines
- Thigh and shin armor: obsidian ceramic metal shell, mirror-like gloss
- Feet: dark polished chrome metal
- Metal details everywhere: exposed mechanical parts, small bolts, vents,
  heat sinks, cable ports with metallic highlights
- One thin emissive cyan light strip on each shoulder, each arm, and each leg
```

## 二、中文版（Tripo3D / 国内工具）

```
一个全身人形机器人，中性放松的站姿，全身居中视角，高级光滑的黑色设计，
参考 ArtStation 与 Sketchfab 上高端硬表面机器人设计，纯黑背景上的产品级摄影构图，
强边缘光与明亮反光，PBR 材质，高光泽镜面，游戏资产质量，不要文字，不要logo。
各部位材质：
- 头部外壳：透明烟熏玻璃，半透明，透出头部内部的机械结构
- 面部面罩：亮黑色玻璃，细微镜面反光
- 颈部与衣领：钢琴漆亮黑金属，湿润感反光
- 胸甲：高光钢琴黑，带两小块碳纤维点缀，中央有一块透明玻璃舱盖透出内部发光机械
- 肩甲：抛光镜面金属，强镜面反射
- 大臂与小臂护甲：钢琴漆亮黑金属外壳面板，边缘锐利高光，每只小臂有一小块透明玻璃窗
- 肘部、膝部与手指关节：拉丝深色金属机械零部件，可见螺栓与液压杆
- 手部：抛光深色镜面金属，精细高光
- 腰部与腹部：亮黑陶瓷，带深灰色细面板线
- 大腿与小腿护甲：黑曜石陶瓷金属外壳，镜面光泽
- 脚部：深色抛光镜面金属
- 全身金属细节：外露机械零部件、小螺栓、散热口、散热片、线缆接口，带金属高光
- 肩部、手臂、腿部各有一条细细的青色自发光灯带
```

## 三、负面提示词（negative prompt）

```
colorful, cartoon, toy-like, low poly, blurry, distorted limbs, extra limbs,
missing limbs, background objects, watermark, text, logo, too bright neon,
plastic look, matte finish, dull surface, flat lighting, clay render, chibi
```

## 三·五、单独生成贴图/材质提示词（模型形状不动，只换材质）

> 用法：模型已生成，不想重做造型 → 上传现有模型，用
> **Meshy「Text to Texture / Retexture」** 或 **Tripo3D「Texture」** 功能，
> 粘贴下面的提示词只重新生成 PBR 贴图。

**英文（Text to Texture，按部位→材质，含透明件）**

```
Premium sci-fi robot surface, PBR texture maps, 4K, no text, no logo.
Material per body part:
- Head shell: transparent smoked glass, semi-transparent with subtle reflections,
  revealing mechanical structure inside the head
- Face visor: glossy black glass with subtle mirror reflections
- Neck and collar: piano-black lacquered metal, wet-look reflections
- Chest plate: high-gloss piano black with two small carbon fiber inserts,
  one transparent glass hatch in the center revealing glowing inner machinery
- Shoulder armor: polished chrome metal, strong mirror reflections
- Upper and lower arm armor: piano-black lacquered metal shell panels with crisp
  edge highlights; a small transparent glass window on each forearm
- Elbow, knee and finger joints: brushed dark metal mechanical parts with fine
  highlight streaks, visible bolts and pistons
- Hands: polished dark chrome, precise specular details
- Waist and abdomen: glossy black ceramic with thin dark gray panel lines
- Thigh and shin armor: obsidian ceramic metal shell, mirror-like gloss
- Feet: dark polished chrome metal
- Metal details everywhere: exposed mechanical parts, small bolts, vents,
  heat sinks, cable ports with metallic highlights
- One thin emissive cyan light strip on each shoulder, each arm, and each leg
```

**中文版（按部位→材质，含透明件）**

```
高级科幻机器人表面，PBR 贴图，4K，不要文字，不要logo。
各部位材质：
- 头部外壳：透明烟熏玻璃，半透明带细微反光，透出头部内部的机械结构
- 面部面罩：亮黑色玻璃，细微镜面反光
- 颈部与衣领：钢琴漆亮黑金属，湿润感反光
- 胸甲：高光钢琴黑，带两小块碳纤维点缀，中央有一块透明玻璃舱盖透出内部发光机械
- 肩甲：抛光镜面金属，强镜面反射
- 大臂与小臂护甲：钢琴漆亮黑金属外壳面板，边缘锐利高光，每只小臂有一小块透明玻璃窗
- 肘部、膝部与手指关节：拉丝深色金属机械零部件，细密高光纹理，可见螺栓与液压杆
- 手部：抛光深色镜面金属，精细高光
- 腰部与腹部：亮黑陶瓷，带深灰色细面板线
- 大腿与小腿护甲：黑曜石陶瓷金属外壳，镜面光泽
- 脚部：深色抛光镜面金属
- 全身金属细节：外露机械零部件、小螺栓、散热口、散热片、线缆接口，带金属高光
- 肩部、手臂、腿部各有一条细细的青色自发光灯带
```

**要点**：贴图提示词只描述**材质表面**，不描述体型/姿势；别让工具重新建模。
透明部位靠贴图 alpha 通道表达；若工具生成的贴图没有透明通道，
接入时我会在 three.js 里对对应材质单独开 `transparent` 并调透明度。
生成后导出同一 GLB（模型 + 新贴图），发我接入。

## 四、两步法（保真度更高，推荐）

text-to-3D 直接生成姿势/比例不稳定时，先出概念图再 image-to-3D：

**Step 1 文生图（即梦 / 通义万相 / GPT Image）**，然后：
**Step 2** 把图上传到 Meshy 或 Tripo3D 选 **Image to 3D** 生成模型。

文生图提示词同上，结尾追加：

```
... front view, full body visible, centered, plain black background, 4k concept art
```

## 五、生成参数建议

| 项 | 建议 |
|---|---|
| 姿势 | **中性 A-pose / 自然站姿**，双臂自然下垂（我做滚动旋转动作时最好控制） |
| 视角 | 正面、全身完整入画、居中 |
| 背景 | 纯黑（与网页黑背景一致，方便"半隐半现"） |
| 面数 | ≤ 8 万面，GLB ≤ 15MB |
| 材质 | **高反光**：钢琴漆亮黑 + 镜面金属为主，锐利高光；黑背景中靠反光轮廓若隐若现 |
| 发光 | 只要 1-2 条细灯带（青 #00e5ff），不要大面积霓虹 |

## 六、带骨骼绑定（可以写进提示词，但别指望生成工具认）

**结论**：提示词里写 `rigged` / `with skeleton rig` 无害，但 Meshy / Tripo3D / Luma 的
text-to-3D 管线只产出**静态网格**，不会因为提示词就带骨骼。绑定在生成后做，两条路：

### 方案 A：Mixamo 自动绑定（推荐，免费，最稳）

1. Meshy/Tripo3D 生成静态 GLB（提示词不用写 rigged，保持干净）。
2. 上传到 **mixamo.com**（Adobe 免费，需注册）：它自动识别人形并绑定骨骼
   （人形机器人双足双臂可识别；上传前在工具里把模型摆成 T-pose/A-pose 成功率更高）。
3. 在 Mixamo 选动作（Idle / Walking / Waving…）→ 下载 **FBX**（或 glTF）。
4. 把 FBX 发我：我本地化 three.js 0.137 的 FBXLoader 接入，用 AnimationMixer
   播放动作，滚动/鼠标驱动旋转与动作切换。

### 方案 B：生成工具自带绑定

- Meshy 的 Auto-Rig、Tripo3D 的 Rig 功能（如有）可直接出带骨骼 GLB；
- 我这边 GLTFLoader + AnimationMixer 直接播放 GLB 内动画。

### 提示词写法

想试就在提示词末尾加一句（不影响生成质量，工具忽略）：

```
... game asset quality, static mesh preferred, A-pose for rigging, no text, no logo, no background
```

（`A-pose for rigging` 比写 `rigged` 更有用——它让生成姿势更接近绑定需要的标准姿势。）

## 七、接入后我会实现的（无需模型自带）

- **哈苏式半隐半现**：黑色机器人放在纯黑背景里，场景加 rim light 边缘光 + 缓慢呼吸的
  轮廓光扫过，营造"若隐若现"的产品摄影感。
- **滚动旋转 + 动作**：监听页面滚动/鼠标位置，模型随滚动进度 360° 旋转；配合轻微
  悬浮、头部微转、灯带呼吸等小动作（在代码里做，不需要模型自带动画）。
- 若生成工具支持导出**带骨骼（rigged）**的 GLB，我还能做行走/抬手等动作；
  若只有静态网格，也可用 Mixamo 自动绑定后接入。
- 原有举牌/节点/能量管线交互可以按哈苏风格重新取舍（比如改为滚动到 Links 区时
  机器人转身指向链接区）。
