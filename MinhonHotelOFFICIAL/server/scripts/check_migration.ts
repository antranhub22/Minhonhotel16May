import { up, down } from '../db/migrations/001_add_indexes';
import axios from 'axios';

async function testApiEndpoints() {
  const results: { endpoint: string; ok: boolean; error?: string }[] = [];
  try {
    // Test request list
    const reqRes = await axios.get('http://localhost:10000/api/staff/requests');
    results.push({ endpoint: '/api/staff/requests', ok: reqRes.status === 200 });
  } catch (err: any) {
    results.push({ endpoint: '/api/staff/requests', ok: false, error: err.message });
  }
  try {
    // Test order list
    const orderRes = await axios.get('http://localhost:10000/api/staff/orders');
    results.push({ endpoint: '/api/staff/orders', ok: orderRes.status === 200 });
  } catch (err: any) {
    results.push({ endpoint: '/api/staff/orders', ok: false, error: err.message });
  }
  try {
    // Test call summaries
    const sumRes = await axios.get('http://localhost:10000/api/summaries/recent/1');
    results.push({ endpoint: '/api/summaries/recent/1', ok: sumRes.status === 200 });
  } catch (err: any) {
    results.push({ endpoint: '/api/summaries/recent/1', ok: false, error: err.message });
  }
  return results;
}

async function main() {
  console.log('--- Bắt đầu kiểm tra migration index ---');
  try {
    await up();
    console.log('Đã chạy migration thêm index. Bắt đầu kiểm tra API...');
    const results = await testApiEndpoints();
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      console.error('Có lỗi khi kiểm tra API sau migration:', failed);
      await down();
      console.log('Đã rollback migration (xóa index).');
      process.exit(1);
    } else {
      console.log('Tất cả API chính hoạt động bình thường sau khi thêm index. Migration an toàn!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Lỗi khi chạy migration hoặc kiểm tra:', err);
    await down();
    process.exit(1);
  }
}

main(); 