// 验证28键钢琴频率计算
function verifyPianoFrequencies() {
  console.log('🎹 验证28键钢琴频率配置\n');
  
  // 标准频率参考
  const standardFrequencies = {
    'C2': 65.406,
    'D2': 73.416,
    'E2': 82.407,
    'F2': 87.307,
    'G2': 97.999,
    'A2': 110.000,
    'B2': 123.471,
    'C3': 130.813,
    'D3': 146.832,
    'E3': 164.814,
    'F3': 174.614,
    'G3': 195.998,
    'A3': 220.000,
    'B3': 246.942,
    'C4': 261.626, // 中央C
    'D4': 293.665,
    'E4': 329.628,
    'F4': 349.228,
    'G4': 391.995,
    'A4': 440.000, // 标准A
    'B4': 493.883,
    'C5': 523.251,
    'D5': 587.330,
    'E5': 659.255,
    'F5': 698.456,
    'G5': 783.991,
    'A5': 880.000,
    'B5': 987.767
  };
  
  // 我们的计算公式
  function calculateFrequency(row, col) {
    const octave = row + 2; // 从2八度开始: C2, C3, C4, C5
    const c2Frequency = 65.406;
    const semitoneSteps = [0, 2, 4, 5, 7, 9, 11];
    const semitonesFromC2 = (octave - 2) * 12 + semitoneSteps[col];
    return c2Frequency * Math.pow(2, semitonesFromC2 / 12);
  }
  
  // 验证每个音符
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  let allCorrect = true;
  
  console.log('| 行 | 列 | 音符 | 计算频率 | 标准频率 | 误差(%) | 状态 |');
  console.log('|----|----|----- |----------|----------|---------|------|');
  
  for (let i = 0; i < 28; i++) {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const octave = row + 2;
    const noteName = noteNames[col] + octave;
    
    const calculated = calculateFrequency(row, col);
    const standard = standardFrequencies[noteName];
    const error = Math.abs((calculated - standard) / standard * 100);
    const status = error < 0.1 ? '✅' : '❌';
    
    if (error >= 0.1) allCorrect = false;
    
    console.log(`| ${row + 1}  | ${col + 1}  | ${noteName.padEnd(4)} | ${calculated.toFixed(3).padStart(8)} | ${standard.toFixed(3).padStart(8)} | ${error.toFixed(3).padStart(6)}% | ${status}   |`);
  }
  
  console.log('\n📊 验证结果:');
  if (allCorrect) {
    console.log('✅ 所有频率计算正确！误差均小于0.1%');
  } else {
    console.log('❌ 发现频率计算错误，需要修正');
  }
  
  // 特殊音符验证
  console.log('\n🎯 特殊音符验证:');
  const centralC = calculateFrequency(2, 0); // 第3行第1列
  const standardA = calculateFrequency(2, 5); // 第3行第6列
  
  console.log(`中央C4: ${centralC.toFixed(3)} Hz (标准: 261.626 Hz) - ${Math.abs((centralC - 261.626) / 261.626 * 100).toFixed(3)}% 误差`);
  console.log(`标准A4: ${standardA.toFixed(3)} Hz (标准: 440.000 Hz) - ${Math.abs((standardA - 440.000) / 440.000 * 100).toFixed(3)}% 误差`);
}

// 运行验证
verifyPianoFrequencies(); 