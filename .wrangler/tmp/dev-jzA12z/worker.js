var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-qJCWc7/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/templates/admin.ts
var adminPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    /* Custom Styles */
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); transition: all 0.3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    .btn-danger { background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%); transition: all 0.3s; }
    .btn-danger:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    .card-hover { transition: all 0.3s; }
    .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
    
    .toast {
      position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px;
      color: white; font-weight: 500; z-index: 1000; transform: translateX(400px);
      transition: all 0.3s ease-in-out; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .toast.show { transform: translateX(0); }
    .toast.success { background-color: #10b981; }
    .toast.error { background-color: #ef4444; }
    .toast.info { background-color: #3b82f6; }
    
    /* Calendar Styles */
    .calendar-popup {
      display: none;
      position: absolute;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      width: 320px;
      z-index: 100;
      padding: 10px;
      border: 1px solid #e2e8f0;
    }
    .calendar-popup.show { display: block; }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .calendar-day-header {
      text-align: center;
      font-size: 0.8rem;
      color: #718096;
      padding: 5px 0;
    }
    .calendar-day {
      text-align: center;
      padding: 8px 0;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.9rem;
      position: relative;
    }
    .calendar-day:hover { background-color: #ebf4ff; }
    .calendar-day.today { background-color: #bee3f8; font-weight: bold; }
    .calendar-day.selected { background-color: #667eea; color: white; }
    .calendar-day.selected .lunar-text { color: #e2e8f0; }
    .calendar-day.other-month { color: #cbd5e0; }
    .lunar-text {
      font-size: 0.6rem;
      color: #a0aec0;
      margin-top: -2px;
    }
    /* Tooltip Styles */
    .hover-container { position: relative; width: 100%; }
    .hover-text { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: all 0.3s ease; display: block; }
    .hover-text:hover { color: #3b82f6; }
    .hover-tooltip {
      position: fixed; z-index: 9999; background: #1f2937; color: white; padding: 10px 14px;
      border-radius: 8px; font-size: 0.875rem; max-width: 320px; word-wrap: break-word;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); opacity: 0; visibility: hidden;
      transition: all 0.3s ease; transform: translateY(-10px); white-space: normal; pointer-events: none; line-height: 1.4;
    }
    .hover-tooltip.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .hover-tooltip::before {
      content: ''; position: absolute; top: -6px; left: 20px; border-left: 6px solid transparent;
      border-right: 6px solid transparent; border-bottom: 6px solid #1f2937;
    }
    .hover-tooltip.tooltip-above::before { top: auto; bottom: -6px; border-bottom: none; border-top: 6px solid #1f2937; }
  </style>
</head>
<body class="bg-gray-100 min-h-screen font-sans">
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <i class="fas fa-calendar-check text-indigo-600 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-gray-800">\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</span>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-gray-600 text-sm hidden md:block mr-2" id="systemTimeDisplay"></div>
          <a href="/admin/config" class="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150">
            <i class="fas fa-cog mr-1"></i>\u7CFB\u7EDF\u914D\u7F6E
          </a>
          <form action="/api/logout" method="POST" class="inline">
            <button type="submit" class="text-gray-600 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150">
              <i class="fas fa-sign-out-alt mr-1"></i>\u9000\u51FA
            </button>
          </form>
        </div>
      </div>
    </div>
  </nav>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Dashboard Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover border-l-4 border-indigo-500">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-indigo-100 text-indigo-500">
            <i class="fas fa-list-ul text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-500 font-medium">\u603B\u8BA2\u9605\u6570</p>
            <p class="text-2xl font-bold text-gray-800" id="totalCount">-</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover border-l-4 border-green-500">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-500">
            <i class="fas fa-check-circle text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-500 font-medium">\u6D3B\u8DC3\u8BA2\u9605</p>
            <p class="text-2xl font-bold text-gray-800" id="activeCount">-</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover border-l-4 border-yellow-500">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-500">
            <i class="fas fa-clock text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-500 font-medium">\u5373\u5C06\u5230\u671F(7\u5929)</p>
            <p class="text-2xl font-bold text-gray-800" id="expiringCount">-</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover border-l-4 border-blue-500">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-500">
            <i class="fas fa-wallet text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-500 font-medium">\u672C\u6708\u9884\u4F30\u652F\u51FA</p>
            <p class="text-2xl font-bold text-gray-800" id="monthlyExpense">-</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-800"><i class="fas fa-tasks mr-2 text-indigo-500"></i>\u8BA2\u9605\u5217\u8868</h2>
        <button onclick="openModal()" class="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium shadow-md flex items-center">
          <i class="fas fa-plus mr-2"></i>\u6DFB\u52A0\u8BA2\u9605
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u670D\u52A1\u540D\u79F0</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u7C7B\u578B</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u5468\u671F</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u5230\u671F\u65F6\u95F4</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u72B6\u6001</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\u64CD\u4F5C</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="subscriptionList">
            <tr>
              <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i>\u52A0\u8F7D\u4E2D...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div id="subscriptionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative mx-auto p-5 border w-full max-w-xl shadow-lg rounded-xl bg-white">
      <div class="flex justify-between items-center mb-5 pb-3 border-b">
        <h3 class="text-xl font-bold text-gray-900" id="modalTitle">\u6DFB\u52A0\u8BA2\u9605</h3>
        <button id="closeModal" class="text-gray-400 hover:text-gray-600 transition duration-150">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <form id="subscriptionForm" class="space-y-4">
        <input type="hidden" id="subscriptionId">
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">\u670D\u52A1\u540D\u79F0</label>
            <input type="text" id="name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">\u81EA\u5B9A\u4E49\u7C7B\u578B</label>
            <input type="text" id="customType" placeholder="\u5982\uFF1A\u5F71\u89C6\u4F1A\u5458" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">\u5468\u671F\u6570\u503C</label>
            <input type="number" id="periodValue" required min="1" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">\u5468\u671F\u5355\u4F4D</label>
            <select id="periodUnit" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="month">\u6708</option>
              <option value="year">\u5E74</option>
              <option value="day">\u5929</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">\u5F00\u59CB\u65E5\u671F</label>
            <input type="text" id="startDate" required readonly class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white">
            <div id="startDateLunar" class="text-xs text-gray-500 mt-1 h-4"></div>
            
            <!-- Custom Date Picker -->
            <div id="startDatePicker" class="calendar-popup">
              <div class="calendar-header">
                <button type="button" id="startDatePrevMonth" class="text-gray-500 hover:text-indigo-600"><i class="fas fa-chevron-left"></i></button>
                <div class="font-bold text-gray-700"><span id="startDateYear"></span>\u5E74 <span id="startDateMonth"></span></div>
                <button type="button" id="startDateNextMonth" class="text-gray-500 hover:text-indigo-600"><i class="fas fa-chevron-right"></i></button>
              </div>
              <div class="calendar-grid">
                <div class="calendar-day-header">\u65E5</div>
                <div class="calendar-day-header">\u4E00</div>
                <div class="calendar-day-header">\u4E8C</div>
                <div class="calendar-day-header">\u4E09</div>
                <div class="calendar-day-header">\u56DB</div>
                <div class="calendar-day-header">\u4E94</div>
                <div class="calendar-day-header">\u516D</div>
              </div>
              <div id="startDateCalendar" class="calendar-grid"></div>
            </div>
          </div>
          
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">\u5230\u671F\u65E5\u671F</label>
            <input type="text" id="expiryDate" required readonly class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white">
            <div id="expiryDateLunar" class="text-xs text-gray-500 mt-1 h-4"></div>
            
            <!-- Custom Date Picker -->
            <div id="expiryDatePicker" class="calendar-popup">
              <div class="calendar-header">
                <button type="button" id="expiryDatePrevMonth" class="text-gray-500 hover:text-indigo-600"><i class="fas fa-chevron-left"></i></button>
                <div class="font-bold text-gray-700"><span id="expiryDateYear"></span>\u5E74 <span id="expiryDateMonth"></span></div>
                <button type="button" id="expiryDateNextMonth" class="text-gray-500 hover:text-indigo-600"><i class="fas fa-chevron-right"></i></button>
              </div>
              <div class="calendar-grid">
                <div class="calendar-day-header">\u65E5</div>
                <div class="calendar-day-header">\u4E00</div>
                <div class="calendar-day-header">\u4E8C</div>
                <div class="calendar-day-header">\u4E09</div>
                <div class="calendar-day-header">\u56DB</div>
                <div class="calendar-day-header">\u4E94</div>
                <div class="calendar-day-header">\u516D</div>
              </div>
              <div id="expiryDateCalendar" class="calendar-grid"></div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
           <div class="flex items-center">
            <input type="checkbox" id="useLunar" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="useLunar" class="ml-2 block text-sm text-gray-900">\u519C\u5386\u5468\u671F</label>
          </div>
           <div class="flex items-center">
            <input type="checkbox" id="showLunar" checked class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="showLunar" class="ml-2 block text-sm text-gray-900">\u663E\u793A\u519C\u5386</label>
          </div>
          <button type="button" id="calculateExpiryBtn" class="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition">
            <i class="fas fa-calculator mr-1"></i>\u63A8\u7B97\u5230\u671F\u65E5
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">\u5907\u6CE8\u4FE1\u606F</label>
          <textarea id="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">\u63D0\u9192\u8BBE\u7F6E (\u5929)</label>
            <input type="number" id="reminderDays" min="0" value="7" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" title="\u63D0\u524D\u591A\u5C11\u5929\u63D0\u9192\uFF0C0\u8868\u793A\u4EC5\u5F53\u5929\u63D0\u9192">
          </div>
          <div class="flex items-end space-x-4 pb-2">
            <div class="flex items-center">
              <input type="checkbox" id="autoRenew" checked class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="autoRenew" class="ml-2 block text-sm text-gray-900">\u81EA\u52A8\u7EED\u671F</label>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="isActive" checked class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="isActive" class="ml-2 block text-sm text-gray-900">\u542F\u7528\u72B6\u6001</label>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button type="button" id="cancelBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150">\u53D6\u6D88</button>
          <button type="submit" class="btn-primary px-6 py-2 text-white rounded-lg shadow-md font-medium">\u4FDD\u5B58\u8BA2\u9605</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // Lunar Calendar Logic
    const lunarCalendar = {
      lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0],
      gan: ['\u7532', '\u4E59', '\u4E19', '\u4E01', '\u620A', '\u5DF1', '\u5E9A', '\u8F9B', '\u58EC', '\u7678'],
      zhi: ['\u5B50', '\u4E11', '\u5BC5', '\u536F', '\u8FB0', '\u5DF3', '\u5348', '\u672A', '\u7533', '\u9149', '\u620C', '\u4EA5'],
      months: ['\u6B63', '\u4E8C', '\u4E09', '\u56DB', '\u4E94', '\u516D', '\u4E03', '\u516B', '\u4E5D', '\u5341', '\u51AC', '\u814A'],
      days: ['\u521D\u4E00', '\u521D\u4E8C', '\u521D\u4E09', '\u521D\u56DB', '\u521D\u4E94', '\u521D\u516D', '\u521D\u4E03', '\u521D\u516B', '\u521D\u4E5D', '\u521D\u5341', '\u5341\u4E00', '\u5341\u4E8C', '\u5341\u4E09', '\u5341\u56DB', '\u5341\u4E94', '\u5341\u516D', '\u5341\u4E03', '\u5341\u516B', '\u5341\u4E5D', '\u4E8C\u5341', '\u5EFF\u4E00', '\u5EFF\u4E8C', '\u5EFF\u4E09', '\u5EFF\u56DB', '\u5EFF\u4E94', '\u5EFF\u516D', '\u5EFF\u4E03', '\u5EFF\u516B', '\u5EFF\u4E5D', '\u4E09\u5341'],
      
      lunarYearDays: function(year) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) sum += (this.lunarInfo[year - 1900] & i) ? 1 : 0;
        return sum + this.leapDays(year);
      },
      leapDays: function(year) {
        if (this.leapMonth(year)) return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
        return 0;
      },
      leapMonth: function(year) {
        return (this.lunarInfo[year - 1900] & 0xf);
      },
      monthDays: function(year, month) {
        return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
      },
      solar2lunar: function(year, month, day) {
        if (year < 1900 || year > 2100) return -1;
        let offset = (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000;
        let temp = 0, i = 1900;
        for (i = 1900; i < 2101 && offset > 0; i++) {
          temp = this.lunarYearDays(i);
          offset -= temp;
        }
        if (offset < 0) { offset += temp; i--; }
        
        let isLeap = false, leap = this.leapMonth(i);
        let lunarYear = i, lunarMonth = 1;
        
        for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
          if (leap > 0 && lunarMonth == (leap + 1) && isLeap == false) {
            --lunarMonth; isLeap = true; temp = this.leapDays(lunarYear);
          } else {
            temp = this.monthDays(lunarYear, lunarMonth);
          }
          if (isLeap == true && lunarMonth == (leap + 1)) isLeap = false;
          offset -= temp;
        }
        if (offset == 0 && leap > 0 && lunarMonth == leap + 1) if (isLeap) isLeap = false; else { isLeap = true; --lunarMonth; }
        if (offset < 0) { offset += temp; --lunarMonth; }
        
        return {
          year: lunarYear,
          month: lunarMonth,
          day: Math.round(offset + 1),
          isLeap: isLeap,
          yearStr: this.gan[(lunarYear - 4) % 10] + this.zhi[(lunarYear - 4) % 12],
          monthStr: (isLeap ? '\u95F0' : '') + this.months[lunarMonth - 1] + '\u6708',
          dayStr: this.days[Math.round(offset)],
          fullStr: this.gan[(lunarYear - 4) % 10] + this.zhi[(lunarYear - 4) % 12] + '\u5E74 ' + (isLeap ? '\u95F0' : '') + this.months[lunarMonth - 1] + '\u6708' + this.days[Math.round(offset)]
        };
      }
    };
    
    // Lunar Business Logic
    const lunarBiz = {
        lunar2solar: function(lunar) {
            let offset = 0;
            // Scan from 1900
            for (let i = 1900; i < lunar.year; i++) offset += lunarCalendar.lunarYearDays(i);
            let leap = lunarCalendar.leapMonth(lunar.year);
            for (let i = 1; i < lunar.month; i++) {
                offset += lunarCalendar.monthDays(lunar.year, i);
                if (leap > 0 && i === leap) offset += lunarCalendar.leapDays(lunar.year);
            }
            if (lunar.isLeap) offset += lunarCalendar.monthDays(lunar.year, lunar.month);
            offset += lunar.day - 1;
            
            const baseDate = new Date(Date.UTC(1900, 0, 31));
            const solarDate = new Date(baseDate.getTime() + offset * 86400000);
            return {
                year: solarDate.getUTCFullYear(),
                month: solarDate.getUTCMonth() + 1,
                day: solarDate.getUTCDate()
            };
        },
        addLunarPeriod: function(lunar, value, unit) {
            let { year, month, day, isLeap } = lunar;
            if (unit === 'year') {
                year += value;
            } else if (unit === 'month') {
                let total = month + value;
                year += Math.floor((total - 1) / 12);
                month = (total - 1) % 12 + 1;
            } else if (unit === 'day') {
                const solar = this.lunar2solar(lunar);
                const date = new Date(Date.UTC(solar.year, solar.month - 1, solar.day));
                date.setDate(date.getDate() + value);
                return lunarCalendar.solar2lunar(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
            }
            
            // Adjust day
            let leap = lunarCalendar.leapMonth(year);
            let maxDays = lunarCalendar.monthDays(year, month);
            if (isLeap && leap === month) maxDays = lunarCalendar.leapDays(year);
            if (day > maxDays) day = maxDays;
            
            return { year, month, day, isLeap: (isLeap && leap === month) };
        }
    };
    
    // UI Helpers
    function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') + ' mr-2"></i>' + message;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    }
    
    // Custom Date Picker Class
    class CustomDatePicker {
      constructor(inputId, pickerId, calendarId, monthId, yearId, prevBtnId, nextBtnId) {
        this.input = document.getElementById(inputId);
        this.picker = document.getElementById(pickerId);
        this.calendar = document.getElementById(calendarId);
        this.monthEl = document.getElementById(monthId);
        this.yearEl = document.getElementById(yearId);
        this.prevBtn = document.getElementById(prevBtnId);
        this.nextBtn = document.getElementById(nextBtnId);
        
        this.currentDate = new Date();
        this.selectedDate = null;
        
        this.init();
      }
      
      init() {
        this.input.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.calendar-popup').forEach(p => {
             if(p.id !== this.picker.id) p.classList.remove('show');
          });
          this.picker.classList.toggle('show');
          this.render();
        });
        
        this.picker.addEventListener('click', (e) => e.stopPropagation());
        
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.picker.contains(e.target) && e.target !== this.input) {
                this.picker.classList.remove('show');
            }
        });
      }
      
      render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.monthEl.textContent = ['1\u6708', '2\u6708', '3\u6708', '4\u6708', '5\u6708', '6\u6708', '7\u6708', '8\u6708', '9\u6708', '10\u6708', '11\u6708', '12\u6708'][month];
        this.yearEl.textContent = year;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        this.calendar.innerHTML = '';
        
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
          const div = document.createElement('div');
          this.calendar.appendChild(div);
        }
        
        const today = new Date();
        
        for (let i = 1; i <= daysInMonth; i++) {
          const div = document.createElement('div');
          div.className = 'calendar-day';
          div.textContent = i;
          
          if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            div.classList.add('today');
          }
          
          if (this.selectedDate && 
              year === this.selectedDate.getFullYear() && 
              month === this.selectedDate.getMonth() && 
              i === this.selectedDate.getDate()) {
            div.classList.add('selected');
          }
          
          // Lunar
          const lunar = lunarCalendar.solar2lunar(year, month + 1, i);
          if (lunar) {
            const lunarSpan = document.createElement('div');
            lunarSpan.className = 'lunar-text';
            lunarSpan.textContent = lunar.day === 1 ? lunar.monthStr : lunar.dayStr;
            div.appendChild(lunarSpan);
          }
          
          div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectDate(new Date(year, month, i));
          });
          
          this.calendar.appendChild(div);
        }
      }
      
      selectDate(date) {
        this.selectedDate = date;
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        this.input.value = \`\${year}-\${month.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`;
        
        const lunar = lunarCalendar.solar2lunar(year, month, day);
        const lunarDivId = this.input.id + 'Lunar';
        const lunarDiv = document.getElementById(lunarDivId);
        if (lunarDiv && lunar) {
          lunarDiv.textContent = \`\u519C\u5386: \${lunar.monthStr}\${lunar.dayStr}\`;
        }
        
        this.picker.classList.remove('show');
        this.render();
        
        // Trigger change event manually
        const event = new Event('change');
        this.input.dispatchEvent(event);
      }
      
      setDate(dateStr) {
        if (!dateStr) return;
        this.selectedDate = new Date(dateStr);
        this.currentDate = new Date(dateStr);
        this.input.value = dateStr;
        
        const lunarDivId = this.input.id + 'Lunar';
        const lunarDiv = document.getElementById(lunarDivId);
        if (lunarDiv) {
            const year = this.selectedDate.getFullYear();
            const month = this.selectedDate.getMonth() + 1;
            const day = this.selectedDate.getDate();
            const lunar = lunarCalendar.solar2lunar(year, month, day);
            if (lunar) lunarDiv.textContent = \`\u519C\u5386: \${lunar.monthStr}\${lunar.dayStr}\`;
        }
      }
      
      destroy() {
         // Placeholder for cleanup if needed
      }
    }

    // Initialize Global Variables
    let subscriptions = [];
    let startDatePicker, expiryDatePicker;

    // Load Subscriptions
    async function loadSubscriptions() {
      const tbody = document.getElementById('subscriptionList');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10"><i class="fas fa-spinner fa-spin mr-2"></i>\u52A0\u8F7D\u4E2D...</td></tr>';
      
      try {
        const res = await fetch('/api/subscriptions');
        subscriptions = await res.json();
        
        renderSubscriptions();
        updateStats();
      } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-red-500">\u52A0\u8F7D\u5931\u8D25</td></tr>';
        showToast('\u52A0\u8F7D\u5931\u8D25', 'error');
      }
    }
    
    function renderSubscriptions() {
        const tbody = document.getElementById('subscriptionList');
        tbody.innerHTML = '';
        
        if (subscriptions.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-gray-500">\u6682\u65E0\u8BA2\u9605\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0</td></tr>';
          return;
        }
        
        subscriptions.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        
        const now = new Date();
        const unitMap = { day: '\u5929', month: '\u6708', year: '\u5E74' };
        
        subscriptions.forEach(sub => {
          const tr = document.createElement('tr');
          const exp = new Date(sub.expiryDate);
          // Calculate diff ignoring time
          const today = new Date();
          today.setHours(0,0,0,0);
          const expDay = new Date(exp);
          expDay.setHours(0,0,0,0);
          const diff = Math.ceil((expDay - today) / (1000 * 60 * 60 * 24));
          
          let statusHtml = '';
          if (sub.isActive === false) statusHtml = '<span class="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">\u5DF2\u505C\u7528</span>';
          else if (diff < 0) statusHtml = '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">\u5DF2\u8FC7\u671F</span>';
          else if (diff <= (sub.reminderDays || 7)) statusHtml = '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">\u5373\u5C06\u5230\u671F</span>';
          else statusHtml = '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">\u6B63\u5E38</span>';
          
          const dateStr = exp.toISOString().split('T')[0];
          
          tr.innerHTML = \`
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">\${sub.name}</div>
                \${sub.notes ? \`<div class="text-xs text-gray-500">\${sub.notes}</div>\` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${sub.customType || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${sub.periodValue}\${unitMap[sub.periodUnit]}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              \${dateStr}
              <div class="text-xs text-gray-400">\${sub.useLunar ? '\u519C\u5386' : '\u516C\u5386'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">\${statusHtml}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button onclick="openModal('\${sub.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3"><i class="fas fa-edit"></i></button>
              <button onclick="toggleStatus('\${sub.id}', \${!sub.isActive})" class="text-blue-600 hover:text-blue-900 mr-3" title="\${sub.isActive ? '\u505C\u7528' : '\u542F\u7528'}">
                <i class="fas \${sub.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
              </button>
              <button onclick="deleteSubscription('\${sub.id}')" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
              <button onclick="testNotify('\${sub.id}')" class="text-yellow-600 hover:text-yellow-900 ml-3" title="\u53D1\u9001\u6D4B\u8BD5\u901A\u77E5"><i class="fas fa-bell"></i></button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
    }
    
    function updateStats() {
        const active = subscriptions.filter(s => s.isActive !== false).length;
        const total = subscriptions.length;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const expiring = subscriptions.filter(s => {
          if (s.isActive === false) return false;
          const exp = new Date(s.expiryDate);
          exp.setHours(0,0,0,0);
          const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 7;
        }).length;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('expiringCount').textContent = expiring;
        document.getElementById('monthlyExpense').textContent = '\xA50'; 
    }
    
    // Modal Functions
    async function openModal(id) {
      document.getElementById('subscriptionForm').reset();
      document.getElementById('subscriptionId').value = '';
      document.getElementById('modalTitle').textContent = '\u6DFB\u52A0\u8BA2\u9605';
      document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
      
      // Default expiry +1 month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      document.getElementById('expiryDate').value = nextMonth.toISOString().split('T')[0];
      
      document.getElementById('useLunar').checked = false;
      document.getElementById('showLunar').checked = true;
      document.getElementById('isActive').checked = true;
      document.getElementById('autoRenew').checked = true;
      document.getElementById('periodValue').value = 1;
      document.getElementById('periodUnit').value = 'month';
      document.getElementById('reminderDays').value = 7;
      
      if (id) {
          const sub = subscriptions.find(s => s.id === id);
          if (sub) {
             document.getElementById('modalTitle').textContent = '\u7F16\u8F91\u8BA2\u9605';
             document.getElementById('subscriptionId').value = sub.id;
             document.getElementById('name').value = sub.name;
             document.getElementById('customType').value = sub.customType || '';
             document.getElementById('notes').value = sub.notes || '';
             document.getElementById('isActive').checked = sub.isActive !== false;
             document.getElementById('autoRenew').checked = sub.autoRenew !== false;
             document.getElementById('startDate').value = sub.startDate ? sub.startDate.split('T')[0] : '';
             document.getElementById('expiryDate').value = sub.expiryDate.split('T')[0];
             document.getElementById('periodValue').value = sub.periodValue || 1;
             document.getElementById('periodUnit').value = sub.periodUnit || 'month';
             document.getElementById('reminderDays').value = sub.reminderDays !== undefined ? sub.reminderDays : 7;
             document.getElementById('useLunar').checked = !!sub.useLunar;
          }
      }
      
      document.getElementById('subscriptionModal').classList.remove('hidden');
      
      // Init Pickers
      setTimeout(() => {
        if (startDatePicker) startDatePicker.destroy();
        if (expiryDatePicker) expiryDatePicker.destroy();
        startDatePicker = new CustomDatePicker('startDate', 'startDatePicker', 'startDateCalendar', 'startDateMonth', 'startDateYear', 'startDatePrevMonth', 'startDateNextMonth');
        expiryDatePicker = new CustomDatePicker('expiryDate', 'expiryDatePicker', 'expiryDateCalendar', 'expiryDateMonth', 'expiryDateYear', 'expiryDatePrevMonth', 'expiryDateNextMonth');
        updateLunarDisplay('startDate', 'startDateLunar');
        updateLunarDisplay('expiryDate', 'expiryDateLunar');
        toggleLunarDisplay();
      }, 50);
    }
    
    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('subscriptionModal').classList.add('hidden');
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
      document.getElementById('subscriptionModal').classList.add('hidden');
    });
    
    // Form Submit
    document.getElementById('subscriptionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('subscriptionId').value;
      const data = {
        name: document.getElementById('name').value,
        customType: document.getElementById('customType').value,
        notes: document.getElementById('notes').value,
        isActive: document.getElementById('isActive').checked,
        autoRenew: document.getElementById('autoRenew').checked,
        startDate: document.getElementById('startDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        periodValue: parseInt(document.getElementById('periodValue').value),
        periodUnit: document.getElementById('periodUnit').value,
        reminderDays: parseInt(document.getElementById('reminderDays').value),
        useLunar: document.getElementById('useLunar').checked
      };
      
      const btn = e.target.querySelector('button[type="submit"]');
      const orgHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>\u4FDD\u5B58\u4E2D...';
      btn.disabled = true;
      
      try {
        const url = id ? '/api/subscriptions/' + id : '/api/subscriptions';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
        const result = await res.json();
        
        if (result.success || res.status === 200 || res.status === 201) {
          showToast('\u4FDD\u5B58\u6210\u529F', 'success');
          document.getElementById('subscriptionModal').classList.add('hidden');
          loadSubscriptions();
        } else {
          showToast('\u4FDD\u5B58\u5931\u8D25: ' + (result.message || '\u672A\u77E5\u9519\u8BEF'), 'error');
        }
      } catch (err) {
        showToast('\u4FDD\u5B58\u5931\u8D25', 'error');
      } finally {
        btn.innerHTML = orgHtml;
        btn.disabled = false;
      }
    });
    
    // Actions
    async function deleteSubscription(id) {
      if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u5417\uFF1F')) return;
      try {
        const res = await fetch('/api/subscriptions/' + id, { method: 'DELETE' });
        const result = await res.json();
        if (result.success || res.ok) {
          showToast('\u5220\u9664\u6210\u529F', 'success');
          loadSubscriptions();
        } else {
          showToast('\u5220\u9664\u5931\u8D25', 'error');
        }
      } catch (err) {
        showToast('\u5220\u9664\u5931\u8D25', 'error');
      }
    }
    
    async function toggleStatus(id, isActive) {
      try {
        const res = await fetch('/api/subscriptions/' + id + '/toggle-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive })
        });
        const result = await res.json();
        if (result.success) {
          showToast('\u72B6\u6001\u66F4\u65B0\u6210\u529F', 'success');
          loadSubscriptions();
        } else {
          showToast('\u66F4\u65B0\u5931\u8D25', 'error');
        }
      } catch (error) {
        showToast('\u66F4\u65B0\u5931\u8D25', 'error');
      }
    }
    
    async function testNotify(id) {
        try {
            showToast('\u53D1\u9001\u6D4B\u8BD5\u901A\u77E5...', 'info');
            const res = await fetch('/api/subscriptions/' + id + '/test-notify', { method: 'POST' });
            const result = await res.json();
            if (result.success) {
                showToast('\u6D4B\u8BD5\u901A\u77E5\u5DF2\u53D1\u9001', 'success');
            } else {
                showToast(result.message || '\u53D1\u9001\u5931\u8D25', 'error');
            }
        } catch (e) {
            showToast('\u53D1\u9001\u5931\u8D25', 'error');
        }
    }
    
    // Helpers
    function updateLunarDisplay(inputId, displayId) {
      const dateStr = document.getElementById(inputId).value;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const lunar = lunarCalendar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      if (lunar !== -1) {
        document.getElementById(displayId).textContent = lunar.fullStr;
      }
    }
    
    function toggleLunarDisplay() {
      const show = document.getElementById('showLunar').checked;
      const displays = document.querySelectorAll('#startDateLunar, #expiryDateLunar, .lunar-text');
      displays.forEach(el => el.style.display = show ? 'block' : 'none');
    }
    
    function calculateExpiryDate() {
      const startStr = document.getElementById('startDate').value;
      const val = parseInt(document.getElementById('periodValue').value);
      const unit = document.getElementById('periodUnit').value;
      const useLunar = document.getElementById('useLunar').checked;
      
      if (!startStr || !val) return;
      
      const startDate = new Date(startStr);
      let expiryDate;
      
      if (useLunar) {
        const lunar = lunarCalendar.solar2lunar(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
        if (lunar === -1) return;
        const nextLunar = lunarBiz.addLunarPeriod(lunar, val, unit);
        const solar = lunarBiz.lunar2solar(nextLunar);
        expiryDate = new Date(Date.UTC(solar.year, solar.month - 1, solar.day));
      } else {
        expiryDate = new Date(startDate);
        if (unit === 'day') expiryDate.setDate(expiryDate.getDate() + val);
        else if (unit === 'month') expiryDate.setMonth(expiryDate.getMonth() + val);
        else if (unit === 'year') expiryDate.setFullYear(expiryDate.getFullYear() + val);
      }
      
      document.getElementById('expiryDate').value = expiryDate.toISOString().split('T')[0];
      updateLunarDisplay('expiryDate', 'expiryDateLunar');
    }
    
    // Init
    document.addEventListener('DOMContentLoaded', () => {
      loadSubscriptions();
      
      // Event Listeners
      ['startDate', 'periodValue', 'periodUnit', 'useLunar'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', calculateExpiryDate);
      });
      document.getElementById('calculateExpiryBtn').addEventListener('click', calculateExpiryDate);
      document.getElementById('showLunar').addEventListener('change', toggleLunarDisplay);
      
      // Timezone check
      setInterval(() => {
        const last = localStorage.getItem('timezoneUpdated');
        if (last && Date.now() - parseInt(last) < 5000) {
          localStorage.removeItem('timezoneUpdated');
          location.reload();
        }
      }, 2000);
      
      // System Time
      function updateTime() {
        const el = document.getElementById('systemTimeDisplay');
        if(el) el.textContent = new Date().toLocaleString();
      }
      updateTime();
      setInterval(updateTime, 1000);
    });
  <\/script>
</body>
</html>
`;

// src/templates/config.ts
var configPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u7CFB\u7EDF\u914D\u7F6E - \u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); transition: all 0.3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    .btn-secondary { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); transition: all 0.3s; }
    .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    
    .toast {
      position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px;
      color: white; font-weight: 500; z-index: 1000; transform: translateX(400px);
      transition: all 0.3s ease-in-out; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .toast.show { transform: translateX(0); }
    .toast.success { background-color: #10b981; }
    .toast.error { background-color: #ef4444; }
    .toast.info { background-color: #3b82f6; }
    .toast.warning { background-color: #f59e0b; }
    
    .config-section { 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 16px; 
      margin-bottom: 24px; 
    }
    .config-section.active { 
      background-color: #f8fafc; 
      border-color: #6366f1; 
    }
    .config-section.inactive { 
      background-color: #f9fafb; 
      opacity: 0.7; 
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <div id="toast-container"></div>

  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <i class="fas fa-calendar-check text-indigo-600 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-gray-800">\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</span>
          <span id="systemTimeDisplay" class="ml-4 text-base text-indigo-600 font-normal"></span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-list mr-1"></i>\u8BA2\u9605\u5217\u8868
          </a>
          <a href="/admin/config" class="text-indigo-600 border-b-2 border-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-cog mr-1"></i>\u7CFB\u7EDF\u914D\u7F6E
          </a>
          <a href="/api/logout" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-sign-out-alt mr-1"></i>\u9000\u51FA\u767B\u5F55
          </a>
        </div>
      </div>
    </div>
  </nav>
  
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">\u7CFB\u7EDF\u914D\u7F6E</h2>
      
      <form id="configForm" class="space-y-8">
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">\u7BA1\u7406\u5458\u8D26\u6237</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="adminUsername" class="block text-sm font-medium text-gray-700">\u7528\u6237\u540D</label>
              <input type="text" id="adminUsername" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="adminPassword" class="block text-sm font-medium text-gray-700">\u5BC6\u7801</label>
              <input type="password" id="adminPassword" placeholder="\u5982\u4E0D\u4FEE\u6539\u5BC6\u7801\uFF0C\u8BF7\u7559\u7A7A" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539\u5F53\u524D\u5BC6\u7801</p>
            </div>
          </div>
        </div>
        
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">\u663E\u793A\u8BBE\u7F6E</h3>
          
          
          <div class="mb-6">
            <label class="inline-flex items-center">
              <input type="checkbox" id="showLunarGlobal" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
              <span class="ml-2 text-sm text-gray-700">\u5728\u901A\u77E5\u4E2D\u663E\u793A\u519C\u5386\u65E5\u671F</span>
            </label>
            <p class="mt-1 text-sm text-gray-500">\u63A7\u5236\u662F\u5426\u5728\u901A\u77E5\u6D88\u606F\u4E2D\u5305\u542B\u519C\u5386\u65E5\u671F\u4FE1\u606F</p>
          </div>
        </div>


        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">\u65F6\u533A\u8BBE\u7F6E</h3>
          <div class="mb-6">
          <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">\u65F6\u533A\u9009\u62E9</label>
          <select id="timezone" name="timezone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            <option value="UTC">\u4E16\u754C\u6807\u51C6\u65F6\u95F4\uFF08UTC+0\uFF09</option>
            <option value="Asia/Shanghai">\u4E2D\u56FD\u6807\u51C6\u65F6\u95F4\uFF08UTC+8\uFF09</option>
            <option value="Asia/Hong_Kong">\u9999\u6E2F\u65F6\u95F4\uFF08UTC+8\uFF09</option>
            <option value="Asia/Taipei">\u53F0\u5317\u65F6\u95F4\uFF08UTC+8\uFF09</option>
            <option value="Asia/Singapore">\u65B0\u52A0\u5761\u65F6\u95F4\uFF08UTC+8\uFF09</option>
            <option value="Asia/Tokyo">\u65E5\u672C\u65F6\u95F4\uFF08UTC+9\uFF09</option>
            <option value="Asia/Seoul">\u97E9\u56FD\u65F6\u95F4\uFF08UTC+9\uFF09</option>
            <option value="America/New_York">\u7F8E\u56FD\u4E1C\u90E8\u65F6\u95F4\uFF08UTC-5\uFF09</option>
            <option value="America/Chicago">\u7F8E\u56FD\u4E2D\u90E8\u65F6\u95F4\uFF08UTC-6\uFF09</option>
            <option value="America/Denver">\u7F8E\u56FD\u5C71\u5730\u65F6\u95F4\uFF08UTC-7\uFF09</option>
            <option value="America/Los_Angeles">\u7F8E\u56FD\u592A\u5E73\u6D0B\u65F6\u95F4\uFF08UTC-8\uFF09</option>
            <option value="Europe/London">\u82F1\u56FD\u65F6\u95F4\uFF08UTC+0\uFF09</option>
            <option value="Europe/Paris">\u5DF4\u9ECE\u65F6\u95F4\uFF08UTC+1\uFF09</option>
            <option value="Europe/Berlin">\u67CF\u6797\u65F6\u95F4\uFF08UTC+1\uFF09</option>
            <option value="Europe/Moscow">\u83AB\u65AF\u79D1\u65F6\u95F4\uFF08UTC+3\uFF09</option>
            <option value="Australia/Sydney">\u6089\u5C3C\u65F6\u95F4\uFF08UTC+10\uFF09</option>
            <option value="Australia/Melbourne">\u58A8\u5C14\u672C\u65F6\u95F4\uFF08UTC+10\uFF09</option>
            <option value="Pacific/Auckland">\u5965\u514B\u5170\u65F6\u95F4\uFF08UTC+12\uFF09</option>
          </select>
            <p class="mt-1 text-sm text-gray-500">\u9009\u62E9\u9700\u8981\u4F7F\u7528\u65F6\u533A\uFF0C\u8BA1\u7B97\u5230\u671F\u65E5\u671F</p>
          </div>
        </div>

        
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">\u901A\u77E5\u8BBE\u7F6E</h3>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">\u901A\u77E5\u65B9\u5F0F\uFF08\u53EF\u591A\u9009\uFF09</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="telegram" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">Telegram</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="notifyx" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
                <span class="ml-2 text-sm text-gray-700 font-semibold">NotifyX</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="webhook" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="wechatbot" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="email" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">\u90AE\u4EF6\u901A\u77E5</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="bark" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">Bark</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="wenotify" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">WeNotify Edge</span>
              </label>
            </div>
            <div class="mt-2 flex flex-wrap gap-4">
              <a href="https://www.notifyx.cn/" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> NotifyX\u5B98\u7F51
              </a>
              <a href="https://push.wangwangit.com" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> \u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5\u5B98\u7F51
              </a>
              <a href="https://developer.work.weixin.qq.com/document/path/91770" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> \u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u6587\u6863
              </a>
              <a href="https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> \u83B7\u53D6 Resend API Key
              </a>
              <a href="https://apps.apple.com/cn/app/bark-customed-notifications/id1403753865" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> Bark iOS\u5E94\u7528
              </a>
            </div>
          </div>
          
          <div id="telegramConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">Telegram \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="tgBotToken" class="block text-sm font-medium text-gray-700">Bot Token</label>
                <input type="text" id="tgBotToken" placeholder="\u4ECE @BotFather \u83B7\u53D6" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="tgChatId" class="block text-sm font-medium text-gray-700">Chat ID</label>
                <input type="text" id="tgChatId" placeholder="\u53EF\u4ECE @userinfobot \u83B7\u53D6" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testTelegramBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 Telegram \u901A\u77E5
              </button>
            </div>
          </div>
          
          <div id="notifyxConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">NotifyX \u914D\u7F6E</h4>
            <div class="mb-4">
              <label for="notifyxApiKey" class="block text-sm font-medium text-gray-700">API Key</label>
              <input type="text" id="notifyxApiKey" placeholder="\u4ECE NotifyX \u5E73\u53F0\u83B7\u53D6\u7684 API Key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">\u4ECE <a href="https://www.notifyx.cn/" target="_blank" class="text-indigo-600 hover:text-indigo-800">NotifyX\u5E73\u53F0</a> \u83B7\u53D6\u7684 API Key</p>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testNotifyXBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 NotifyX \u901A\u77E5
              </button>
            </div>
          </div>

          <div id="wenotifyConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">WeNotify Edge \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="wenotifyUrl" class="block text-sm font-medium text-gray-700">\u670D\u52A1\u5730\u5740</label>
                <input type="url" id="wenotifyUrl" placeholder="https://your-domain.workers.dev" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyToken" class="block text-sm font-medium text-gray-700">API Token</label>
                <input type="text" id="wenotifyToken" placeholder="\u5728 WeNotify Edge \u4E2D\u8BBE\u7F6E\u7684 API_TOKEN" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyUserid" class="block text-sm font-medium text-gray-700">UserID (\u53EF\u9009)</label>
                <input type="text" id="wenotifyUserid" placeholder="OPENID1|OPENID2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyTemplateId" class="block text-sm font-medium text-gray-700">\u6A21\u677FID (\u53EF\u9009)</label>
                <input type="text" id="wenotifyTemplateId" placeholder="\u5FAE\u4FE1\u6A21\u677F\u6D88\u606F ID" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWeNotifyBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 WeNotify Edge
              </button>
            </div>
          </div>

          <div id="webhookConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5 \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label for="webhookUrl" class="block text-sm font-medium text-gray-700">\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5 URL</label>
                <input type="url" id="webhookUrl" placeholder="https://push.wangwangit.com/api/send/your-key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">\u4ECE <a href="https://push.wangwangit.com" target="_blank" class="text-indigo-600 hover:text-indigo-800">\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5\u5E73\u53F0</a> \u83B7\u53D6\u7684\u63A8\u9001URL</p>
              </div>
              <div>
                <label for="webhookMethod" class="block text-sm font-medium text-gray-700">\u8BF7\u6C42\u65B9\u6CD5</label>
                <select id="webhookMethod" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
              <div>
                <label for="webhookHeaders" class="block text-sm font-medium text-gray-700">\u81EA\u5B9A\u4E49\u8BF7\u6C42\u5934 (JSON\u683C\u5F0F\uFF0C\u53EF\u9009)</label>
                <textarea id="webhookHeaders" rows="3" placeholder='{"Authorization": "Bearer your-token", "Content-Type": "application/json"}' class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                <p class="mt-1 text-sm text-gray-500">JSON\u683C\u5F0F\u7684\u81EA\u5B9A\u4E49\u8BF7\u6C42\u5934\uFF0C\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4</p>
              </div>
              <div>
                <label for="webhookTemplate" class="block text-sm font-medium text-gray-700">\u6D88\u606F\u6A21\u677F (JSON\u683C\u5F0F\uFF0C\u53EF\u9009)</label>
                <textarea id="webhookTemplate" rows="4" placeholder='{"title": "{{title}}", "content": "{{content}}", "timestamp": "{{timestamp}}"}' class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                <p class="mt-1 text-sm text-gray-500">\u652F\u6301\u53D8\u91CF: {{title}}, {{content}}, {{timestamp}}\u3002\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\u683C\u5F0F</p>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWebhookBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 \u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5
              </button>
            </div>
          </div>

          <div id="wechatbotConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label for="wechatbotWebhook" class="block text-sm font-medium text-gray-700">\u673A\u5668\u4EBA Webhook URL</label>
                <input type="url" id="wechatbotWebhook" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">\u4ECE\u4F01\u4E1A\u5FAE\u4FE1\u7FA4\u804A\u4E2D\u6DFB\u52A0\u673A\u5668\u4EBA\u83B7\u53D6\u7684 Webhook URL</p>
              </div>
              <div>
                <label for="wechatbotMsgType" class="block text-sm font-medium text-gray-700">\u6D88\u606F\u7C7B\u578B</label>
                <select id="wechatbotMsgType" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="text">\u6587\u672C\u6D88\u606F</option>
                  <option value="markdown">Markdown\u6D88\u606F</option>
                </select>
                <p class="mt-1 text-sm text-gray-500">\u9009\u62E9\u53D1\u9001\u7684\u6D88\u606F\u683C\u5F0F\u7C7B\u578B</p>
              </div>
              <div>
                <label for="wechatbotAtMobiles" class="block text-sm font-medium text-gray-700">@\u624B\u673A\u53F7 (\u53EF\u9009)</label>
                <input type="text" id="wechatbotAtMobiles" placeholder="13800138000,13900139000" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">\u9700\u8981@\u7684\u624B\u673A\u53F7\uFF0C\u591A\u4E2A\u7528\u9017\u53F7\u5206\u9694\uFF0C\u7559\u7A7A\u5219\u4E0D@\u4EFB\u4F55\u4EBA</p>
              </div>
              <div>
                <label class="inline-flex items-center mt-2">
                  <input type="checkbox" id="wechatbotAtAll" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="ml-2 text-sm text-gray-700">@\u6240\u6709\u4EBA</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWechatBotBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 \u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA
              </button>
            </div>
          </div>

          <div id="emailConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">\u90AE\u4EF6\u901A\u77E5 \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="resendApiKey" class="block text-sm font-medium text-gray-700">Resend API Key</label>
                <input type="text" id="resendApiKey" placeholder="re_..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailFrom" class="block text-sm font-medium text-gray-700">\u53D1\u4EF6\u4EBA\u90AE\u7BB1</label>
                <input type="email" id="emailFrom" placeholder="onboarding@resend.dev" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailFromName" class="block text-sm font-medium text-gray-700">\u53D1\u4EF6\u4EBA\u540D\u79F0</label>
                <input type="text" id="emailFromName" placeholder="\u8BA2\u9605\u52A9\u624B" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailTo" class="block text-sm font-medium text-gray-700">\u6536\u4EF6\u4EBA\u90AE\u7BB1</label>
                <input type="email" id="emailTo" placeholder="your@email.com" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testEmailBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 \u90AE\u4EF6\u901A\u77E5
              </button>
            </div>
          </div>

          <div id="barkConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">Bark \u914D\u7F6E</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="barkServer" class="block text-sm font-medium text-gray-700">\u670D\u52A1\u5668\u5730\u5740</label>
                <input type="url" id="barkServer" placeholder="https://api.day.app" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">\u9ED8\u8BA4\u4E3A https://api.day.app\uFF0C\u81EA\u5EFA\u670D\u52A1\u8BF7\u586B\u5199\u5BF9\u5E94\u5730\u5740</p>
              </div>
              <div>
                <label for="barkDeviceKey" class="block text-sm font-medium text-gray-700">\u8BBE\u5907 Key</label>
                <input type="text" id="barkDeviceKey" placeholder="Bark App \u4E2D\u7684 Device Key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label class="inline-flex items-center mt-6">
                  <input type="checkbox" id="barkIsArchive" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="ml-2 text-sm text-gray-700">\u81EA\u52A8\u4FDD\u5B58\u901A\u77E5</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testBarkBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>\u6D4B\u8BD5 Bark \u901A\u77E5
              </button>
            </div>
          </div>

        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary text-white px-6 py-3 rounded-md text-base font-medium flex items-center">
            <i class="fas fa-save mr-2"></i>\u4FDD\u5B58\u914D\u7F6E
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = \`toast \${type}\`;
      
      let icon = '';
      if (type === 'success') icon = '<i class="fas fa-check-circle mr-2"></i>';
      else if (type === 'error') icon = '<i class="fas fa-times-circle mr-2"></i>';
      else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
      else icon = '<i class="fas fa-info-circle mr-2"></i>';
      
      toast.innerHTML = \`\${icon}\${message}\`;
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          container.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    async function loadConfig() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        document.getElementById('adminUsername').value = config.ADMIN_USERNAME || '';
        document.getElementById('tgBotToken').value = config.TG_BOT_TOKEN || '';
        document.getElementById('tgChatId').value = config.TG_CHAT_ID || '';
        document.getElementById('notifyxApiKey').value = config.NOTIFYX_API_KEY || '';
        document.getElementById('wenotifyUrl').value = config.WENOTIFY_URL || '';
        document.getElementById('wenotifyToken').value = config.WENOTIFY_TOKEN || '';
        document.getElementById('wenotifyUserid').value = config.WENOTIFY_USERID || '';
        document.getElementById('wenotifyTemplateId').value = config.WENOTIFY_TEMPLATE_ID || '';
        document.getElementById('webhookUrl').value = config.WEBHOOK_URL || '';
        document.getElementById('webhookMethod').value = config.WEBHOOK_METHOD || 'POST';
        document.getElementById('webhookHeaders').value = config.WEBHOOK_HEADERS || '';
        document.getElementById('webhookTemplate').value = config.WEBHOOK_TEMPLATE || '';
        document.getElementById('showLunarGlobal').checked = config.SHOW_LUNAR === true;
        document.getElementById('wechatbotWebhook').value = config.WECHATBOT_WEBHOOK || '';
        document.getElementById('wechatbotMsgType').value = config.WECHATBOT_MSG_TYPE || 'text';
        document.getElementById('wechatbotAtMobiles').value = config.WECHATBOT_AT_MOBILES || '';
        document.getElementById('wechatbotAtAll').checked = config.WECHATBOT_AT_ALL === 'true';
        document.getElementById('resendApiKey').value = config.RESEND_API_KEY || '';
        document.getElementById('emailFrom').value = config.EMAIL_FROM || '';
        document.getElementById('emailFromName').value = config.EMAIL_FROM_NAME || '';
        document.getElementById('emailTo').value = config.EMAIL_TO || '';
        document.getElementById('barkServer').value = config.BARK_SERVER || 'https://api.day.app';
        document.getElementById('barkDeviceKey').value = config.BARK_DEVICE_KEY || '';
        document.getElementById('barkIsArchive').checked = config.BARK_IS_ARCHIVE === 'true';

        // \u521D\u59CB\u5316\u65F6\u533A\u9009\u62E9
        initTimezoneSelect(config.TIMEZONE || 'UTC');

        const enabledNotifiers = config.ENABLED_NOTIFIERS || ['notifyx'];
        document.querySelectorAll('input[name="enabledNotifiers"]').forEach(checkbox => {
          checkbox.checked = enabledNotifiers.includes(checkbox.value);
        });
        
        toggleNotificationConfigs(enabledNotifiers);
        
      } catch (error) {
        console.error('\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25:', error);
        showToast('\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5', 'error');
      }
    }

    function initTimezoneSelect(selectedTimezone) {
      const timezoneSelect = document.getElementById('timezone');
      
      // \u5E38\u7528\u65F6\u533A\u5217\u8868
      const timezones = [
        { value: 'UTC', name: '\u4E16\u754C\u6807\u51C6\u65F6\u95F4', offset: '+0' },
        { value: 'Asia/Shanghai', name: '\u4E2D\u56FD\u6807\u51C6\u65F6\u95F4', offset: '+8' },
        { value: 'Asia/Hong_Kong', name: '\u9999\u6E2F\u65F6\u95F4', offset: '+8' },
        { value: 'Asia/Taipei', name: '\u53F0\u5317\u65F6\u95F4', offset: '+8' },
        { value: 'Asia/Singapore', name: '\u65B0\u52A0\u5761\u65F6\u95F4', offset: '+8' },
        { value: 'Asia/Tokyo', name: '\u65E5\u672C\u65F6\u95F4', offset: '+9' },
        { value: 'Asia/Seoul', name: '\u97E9\u56FD\u65F6\u95F4', offset: '+9' },
        { value: 'America/New_York', name: '\u7F8E\u56FD\u4E1C\u90E8\u65F6\u95F4', offset: '-5' },
        { value: 'America/Chicago', name: '\u7F8E\u56FD\u4E2D\u90E8\u65F6\u95F4', offset: '-6' },
        { value: 'America/Denver', name: '\u7F8E\u56FD\u5C71\u5730\u65F6\u95F4', offset: '-7' },
        { value: 'America/Los_Angeles', name: '\u7F8E\u56FD\u592A\u5E73\u6D0B\u65F6\u95F4', offset: '-8' },
        { value: 'Europe/London', name: '\u82F1\u56FD\u65F6\u95F4', offset: '+0' },
        { value: 'Europe/Paris', name: '\u5DF4\u9ECE\u65F6\u95F4', offset: '+1' },
        { value: 'Europe/Berlin', name: '\u67CF\u6797\u65F6\u95F4', offset: '+1' },
        { value: 'Europe/Moscow', name: '\u83AB\u65AF\u79D1\u65F6\u95F4', offset: '+3' },
        { value: 'Australia/Sydney', name: '\u6089\u5C3C\u65F6\u95F4', offset: '+10' },
        { value: 'Australia/Melbourne', name: '\u58A8\u5C14\u672C\u65F6\u95F4', offset: '+10' },
        { value: 'Pacific/Auckland', name: '\u5965\u514B\u5170\u65F6\u95F4', offset: '+12' }
      ];
      
      // \u6E05\u7A7A\u73B0\u6709\u9009\u9879
      timezoneSelect.innerHTML = '';
      
      // \u6DFB\u52A0\u65B0\u9009\u9879
      timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.name + '\uFF08UTC' + tz.offset + '\uFF09';
        timezoneSelect.appendChild(option);
      });
      
      // \u8BBE\u7F6E\u9009\u4E2D\u7684\u65F6\u533A
      timezoneSelect.value = selectedTimezone;
    }
    
    function toggleNotificationConfigs(enabledNotifiers) {
      const telegramConfig = document.getElementById('telegramConfig');
      const notifyxConfig = document.getElementById('notifyxConfig');
      const wenotifyConfig = document.getElementById('wenotifyConfig');
      const webhookConfig = document.getElementById('webhookConfig');
      const wechatbotConfig = document.getElementById('wechatbotConfig');
      const emailConfig = document.getElementById('emailConfig');
      const barkConfig = document.getElementById('barkConfig');

      // \u91CD\u7F6E\u6240\u6709\u914D\u7F6E\u533A\u57DF
      [telegramConfig, notifyxConfig, wenotifyConfig, webhookConfig, wechatbotConfig, emailConfig, barkConfig].forEach(config => {
        config.classList.remove('active', 'inactive');
        config.classList.add('inactive');
      });

      // \u6FC0\u6D3B\u9009\u4E2D\u7684\u914D\u7F6E\u533A\u57DF
      enabledNotifiers.forEach(type => {
        if (type === 'telegram') {
          telegramConfig.classList.remove('inactive');
          telegramConfig.classList.add('active');
        } else if (type === 'notifyx') {
          notifyxConfig.classList.remove('inactive');
          notifyxConfig.classList.add('active');
        } else if (type === 'wenotify') {
          wenotifyConfig.classList.remove('inactive');
          wenotifyConfig.classList.add('active');
        } else if (type === 'webhook') {
          webhookConfig.classList.remove('inactive');
          webhookConfig.classList.add('active');
        } else if (type === 'wechatbot') {
          wechatbotConfig.classList.remove('inactive');
          wechatbotConfig.classList.add('active');
        } else if (type === 'email') {
          emailConfig.classList.remove('inactive');
          emailConfig.classList.add('active');
        } else if (type === 'bark') {
          barkConfig.classList.remove('inactive');
          barkConfig.classList.add('active');
        }
      });
    }

    document.querySelectorAll('input[name="enabledNotifiers"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const enabledNotifiers = Array.from(document.querySelectorAll('input[name="enabledNotifiers"]:checked'))
          .map(cb => cb.value);
        toggleNotificationConfigs(enabledNotifiers);
      });
    });
    
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const enabledNotifiers = Array.from(document.querySelectorAll('input[name="enabledNotifiers"]:checked'))
        .map(cb => cb.value);

      if (enabledNotifiers.length === 0) {
        showToast('\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u79CD\u901A\u77E5\u65B9\u5F0F', 'warning');
        return;
      }

      const config = {
        ADMIN_USERNAME: document.getElementById('adminUsername').value.trim(),
        TG_BOT_TOKEN: document.getElementById('tgBotToken').value.trim(),
        TG_CHAT_ID: document.getElementById('tgChatId').value.trim(),
        NOTIFYX_API_KEY: document.getElementById('notifyxApiKey').value.trim(),
        WENOTIFY_URL: document.getElementById('wenotifyUrl').value.trim(),
        WENOTIFY_TOKEN: document.getElementById('wenotifyToken').value.trim(),
        WENOTIFY_USERID: document.getElementById('wenotifyUserid').value.trim(),
        WENOTIFY_TEMPLATE_ID: document.getElementById('wenotifyTemplateId').value.trim(),
        WEBHOOK_URL: document.getElementById('webhookUrl').value.trim(),
        WEBHOOK_METHOD: document.getElementById('webhookMethod').value,
        WEBHOOK_HEADERS: document.getElementById('webhookHeaders').value.trim(),
        WEBHOOK_TEMPLATE: document.getElementById('webhookTemplate').value.trim(),
        SHOW_LUNAR: document.getElementById('showLunarGlobal').checked,
        WECHATBOT_WEBHOOK: document.getElementById('wechatbotWebhook').value.trim(),
        WECHATBOT_MSG_TYPE: document.getElementById('wechatbotMsgType').value,
        WECHATBOT_AT_MOBILES: document.getElementById('wechatbotAtMobiles').value.trim(),
        WECHATBOT_AT_ALL: document.getElementById('wechatbotAtAll').checked.toString(),
        RESEND_API_KEY: document.getElementById('resendApiKey').value.trim(),
        EMAIL_FROM: document.getElementById('emailFrom').value.trim(),
        EMAIL_FROM_NAME: document.getElementById('emailFromName').value.trim(),
        EMAIL_TO: document.getElementById('emailTo').value.trim(),
        BARK_SERVER: document.getElementById('barkServer').value.trim() || 'https://api.day.app',
        BARK_DEVICE_KEY: document.getElementById('barkDeviceKey').value.trim(),
        BARK_IS_ARCHIVE: document.getElementById('barkIsArchive').checked.toString(),
        ENABLED_NOTIFIERS: enabledNotifiers,
        TIMEZONE: document.getElementById('timezone').value.trim()
      };

      const passwordField = document.getElementById('adminPassword');
      if (passwordField.value.trim()) {
        config.ADMIN_PASSWORD = passwordField.value.trim();
      }

      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalContent = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>\u4FDD\u5B58\u4E2D...';
      submitButton.disabled = true;

      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });

        const result = await response.json();

        if (result.success) {
          showToast('\u914D\u7F6E\u4FDD\u5B58\u6210\u529F', 'success');
          passwordField.value = '';
          
          // \u66F4\u65B0\u5168\u5C40\u65F6\u533A\u5E76\u91CD\u65B0\u663E\u793A\u65F6\u95F4
          globalTimezone = config.TIMEZONE;
          showSystemTime();
          
          // \u6807\u8BB0\u65F6\u533A\u5DF2\u66F4\u65B0\uFF0C\u4F9B\u5176\u4ED6\u9875\u9762\u68C0\u6D4B
          localStorage.setItem('timezoneUpdated', Date.now().toString());
          
          // \u5982\u679C\u5F53\u524D\u5728\u8BA2\u9605\u5217\u8868\u9875\u9762\uFF0C\u5219\u81EA\u52A8\u5237\u65B0\u9875\u9762\u4EE5\u66F4\u65B0\u65F6\u533A\u663E\u793A
          if (window.location.pathname === '/admin') {
            window.location.reload();
          }
        } else {
          showToast('\u914D\u7F6E\u4FDD\u5B58\u5931\u8D25: ' + (result.message || '\u672A\u77E5\u9519\u8BEF'), 'error');
        }
      } catch (error) {
        console.error('\u4FDD\u5B58\u914D\u7F6E\u5931\u8D25:', error);
        showToast('\u4FDD\u5B58\u914D\u7F6E\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5', 'error');
      } finally {
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
      }
    });
    
    async function testNotification(type) {
      const buttonId = type === 'telegram' ? 'testTelegramBtn' :
                      type === 'notifyx' ? 'testNotifyXBtn' :
                      type === 'wenotify' ? 'testWeNotifyBtn' :
                      type === 'wechatbot' ? 'testWechatBotBtn' :
                      type === 'email' ? 'testEmailBtn' :
                      type === 'bark' ? 'testBarkBtn' : 'testWebhookBtn';
      const button = document.getElementById(buttonId);
      const originalContent = button.innerHTML;
      const serviceName = type === 'telegram' ? 'Telegram' :
                          type === 'notifyx' ? 'NotifyX' :
                          type === 'wenotify' ? 'WeNotify Edge' :
                          type === 'wechatbot' ? '\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA' :
                          type === 'email' ? '\u90AE\u4EF6\u901A\u77E5' :
                          type === 'bark' ? 'Bark' : '\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5';

      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>\u6D4B\u8BD5\u4E2D...';
      button.disabled = true;

      const config = {};
      if (type === 'telegram') {
        config.TG_BOT_TOKEN = document.getElementById('tgBotToken').value.trim();
        config.TG_CHAT_ID = document.getElementById('tgChatId').value.trim();

        if (!config.TG_BOT_TOKEN || !config.TG_CHAT_ID) {
          showToast('\u8BF7\u5148\u586B\u5199 Telegram Bot Token \u548C Chat ID', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'notifyx') {
        config.NOTIFYX_API_KEY = document.getElementById('notifyxApiKey').value.trim();

        if (!config.NOTIFYX_API_KEY) {
          showToast('\u8BF7\u5148\u586B\u5199 NotifyX API Key', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'wenotify') {
        config.WENOTIFY_URL = document.getElementById('wenotifyUrl').value.trim();
        config.WENOTIFY_TOKEN = document.getElementById('wenotifyToken').value.trim();
        config.WENOTIFY_USERID = document.getElementById('wenotifyUserid').value.trim();
        config.WENOTIFY_TEMPLATE_ID = document.getElementById('wenotifyTemplateId').value.trim();

        if (!config.WENOTIFY_URL || !config.WENOTIFY_TOKEN) {
          showToast('\u8BF7\u5148\u586B\u5199 WeNotify Edge \u670D\u52A1\u5730\u5740\u548C API Token', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'webhook') {
        config.WEBHOOK_URL = document.getElementById('webhookUrl').value.trim();
        config.WEBHOOK_METHOD = document.getElementById('webhookMethod').value;
        config.WEBHOOK_HEADERS = document.getElementById('webhookHeaders').value.trim();
        config.WEBHOOK_TEMPLATE = document.getElementById('webhookTemplate').value.trim();

        if (!config.WEBHOOK_URL) {
          showToast('\u8BF7\u5148\u586B\u5199 \u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5 URL', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'wechatbot') {
        config.WECHATBOT_WEBHOOK = document.getElementById('wechatbotWebhook').value.trim();
        config.WECHATBOT_MSG_TYPE = document.getElementById('wechatbotMsgType').value;
        config.WECHATBOT_AT_MOBILES = document.getElementById('wechatbotAtMobiles').value.trim();
        config.WECHATBOT_AT_ALL = document.getElementById('wechatbotAtAll').checked.toString();

        if (!config.WECHATBOT_WEBHOOK) {
          showToast('\u8BF7\u5148\u586B\u5199\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA Webhook URL', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'email') {
        config.RESEND_API_KEY = document.getElementById('resendApiKey').value.trim();
        config.EMAIL_FROM = document.getElementById('emailFrom').value.trim();
        config.EMAIL_FROM_NAME = document.getElementById('emailFromName').value.trim();
        config.EMAIL_TO = document.getElementById('emailTo').value.trim();

        if (!config.RESEND_API_KEY || !config.EMAIL_FROM || !config.EMAIL_TO) {
          showToast('\u8BF7\u5148\u586B\u5199 Resend API Key\u3001\u53D1\u4EF6\u4EBA\u90AE\u7BB1\u548C\u6536\u4EF6\u4EBA\u90AE\u7BB1', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'bark') {
        config.BARK_SERVER = document.getElementById('barkServer').value.trim() || 'https://api.day.app';
        config.BARK_DEVICE_KEY = document.getElementById('barkDeviceKey').value.trim();
        config.BARK_IS_ARCHIVE = document.getElementById('barkIsArchive').checked.toString();

        if (!config.BARK_DEVICE_KEY) {
          showToast('\u8BF7\u5148\u586B\u5199 Bark \u8BBE\u5907Key', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      }

      try {
        const response = await fetch('/api/test-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: type, ...config })
        });

        const result = await response.json();

        if (result.success) {
          showToast(serviceName + ' \u901A\u77E5\u6D4B\u8BD5\u6210\u529F\uFF01', 'success');
        } else {
          showToast(serviceName + ' \u901A\u77E5\u6D4B\u8BD5\u5931\u8D25: ' + (result.message || '\u672A\u77E5\u9519\u8BEF'), 'error');
        }
      } catch (error) {
        console.error('\u6D4B\u8BD5\u901A\u77E5\u5931\u8D25:', error);
        showToast('\u6D4B\u8BD5\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5', 'error');
      } finally {
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    }
    
    document.getElementById('testTelegramBtn').addEventListener('click', () => {
      testNotification('telegram');
    });
    
    document.getElementById('testNotifyXBtn').addEventListener('click', () => {
      testNotification('notifyx');
    });

    document.getElementById('testWeNotifyBtn').addEventListener('click', () => {
      testNotification('wenotify');
    });

    document.getElementById('testWebhookBtn').addEventListener('click', () => {
      testNotification('webhook');
    });

    document.getElementById('testWechatBotBtn').addEventListener('click', () => {
      testNotification('wechatbot');
    });

    document.getElementById('testEmailBtn').addEventListener('click', () => {
      testNotification('email');
    });

    document.getElementById('testBarkBtn').addEventListener('click', () => {
      testNotification('bark');
    });

    window.addEventListener('load', loadConfig);
    
    // \u5168\u5C40\u65F6\u533A\u914D\u7F6E
    let globalTimezone = 'UTC';
    
    // \u5B9E\u65F6\u663E\u793A\u7CFB\u7EDF\u65F6\u95F4\u548C\u65F6\u533A
    async function showSystemTime() {
      try {
        // \u83B7\u53D6\u540E\u53F0\u914D\u7F6E\u7684\u65F6\u533A
        const response = await fetch('/api/config');
        const config = await response.json();
        globalTimezone = config.TIMEZONE || 'UTC';
        
        // \u683C\u5F0F\u5316\u5F53\u524D\u65F6\u95F4
        function formatTime(dt, tz) {
          return dt.toLocaleString('zh-CN', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        function formatTimezoneDisplay(tz) {
          try {
            // \u4F7F\u7528\u66F4\u51C6\u786E\u7684\u65F6\u533A\u504F\u79FB\u8BA1\u7B97\u65B9\u6CD5
            const now = new Date();
            const dtf = new Intl.DateTimeFormat('en-US', {
              timeZone: tz,
              hour12: false,
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            const parts = dtf.formatToParts(now);
            const get = type => Number(parts.find(x => x.type === type).value);
            const target = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
            const utc = now.getTime();
            const offset = Math.round((target - utc) / (1000 * 60 * 60));
            
            // \u65F6\u533A\u4E2D\u6587\u540D\u79F0\u6620\u5C04
            const timezoneNames = {
              'UTC': '\u4E16\u754C\u6807\u51C6\u65F6\u95F4',
              'Asia/Shanghai': '\u4E2D\u56FD\u6807\u51C6\u65F6\u95F4',
              'Asia/Hong_Kong': '\u9999\u6E2F\u65F6\u95F4',
              'Asia/Taipei': '\u53F0\u5317\u65F6\u95F4',
              'Asia/Singapore': '\u65B0\u52A0\u5761\u65F6\u95F4',
              'Asia/Tokyo': '\u65E5\u672C\u65F6\u95F4',
              'Asia/Seoul': '\u97E9\u56FD\u65F6\u95F4',
              'America/New_York': '\u7F8E\u56FD\u4E1C\u90E8\u65F6\u95F4',
              'America/Los_Angeles': '\u7F8E\u56FD\u592A\u5E73\u6D0B\u65F6\u95F4',
              'America/Chicago': '\u7F8E\u56FD\u4E2D\u90E8\u65F6\u95F4',
              'America/Denver': '\u7F8E\u56FD\u5C71\u5730\u65F6\u95F4',
              'Europe/London': '\u82F1\u56FD\u65F6\u95F4',
              'Europe/Paris': '\u5DF4\u9ECE\u65F6\u95F4',
              'Europe/Berlin': '\u67CF\u6797\u65F6\u95F4',
              'Europe/Moscow': '\u83AB\u65AF\u79D1\u65F6\u95F4',
              'Australia/Sydney': '\u6089\u5C3C\u65F6\u95F4',
              'Australia/Melbourne': '\u58A8\u5C14\u672C\u65F6\u95F4',
              'Pacific/Auckland': '\u5965\u514B\u5170\u65F6\u95F4'
            };
            
            const offsetStr = offset >= 0 ? '+' + offset : offset;
            const timezoneName = timezoneNames[tz] || tz;
            return timezoneName + ' (UTC' + offsetStr + ')';
          } catch (error) {
            console.error('\u683C\u5F0F\u5316\u65F6\u533A\u663E\u793A\u5931\u8D25:', error);
            return tz;
          }
        }
        function update() {
          const now = new Date();
          const timeStr = formatTime(now, globalTimezone);
          const tzStr = formatTimezoneDisplay(globalTimezone);
          const el = document.getElementById('systemTimeDisplay');
          if (el) {
            el.textContent = timeStr + '  ' + tzStr;
          }
        }
        update();
        // \u6BCF\u79D2\u5237\u65B0
        setInterval(update, 1000);
        
        // \u5B9A\u671F\u68C0\u67E5\u65F6\u533A\u53D8\u5316\u5E76\u91CD\u65B0\u52A0\u8F7D\u8BA2\u9605\u5217\u8868\uFF08\u6BCF30\u79D2\u68C0\u67E5\u4E00\u6B21\uFF09
        setInterval(async () => {
          try {
            const response = await fetch('/api/config');
            const config = await response.json();
            const newTimezone = config.TIMEZONE || 'UTC';
            
            if (globalTimezone !== newTimezone) {
              globalTimezone = newTimezone;
              console.log('\u65F6\u533A\u5DF2\u66F4\u65B0\u4E3A:', globalTimezone);
              // \u91CD\u65B0\u52A0\u8F7D\u8BA2\u9605\u5217\u8868\u4EE5\u66F4\u65B0\u5929\u6570\u8BA1\u7B97
              loadSubscriptions();
            }
          } catch (error) {
            console.error('\u68C0\u67E5\u65F6\u533A\u66F4\u65B0\u5931\u8D25:', error);
          }
        }, 30000);
      } catch (e) {
        // \u51FA\u9519\u65F6\u663E\u793A\u672C\u5730\u65F6\u95F4
        const el = document.getElementById('systemTimeDisplay');
        if (el) {
          el.textContent = new Date().toLocaleString();
        }
      }
    }
    showSystemTime();
  <\/script>
</body>
</html>
`;

// src/templates/login.ts
var loginPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <style>
    .login-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .login-box {
      backdrop-filter: blur(8px);
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: all 0.3s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    .input-field {
      transition: all 0.3s;
      border: 1px solid #e2e8f0;
    }
    .input-field:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
    }
  </style>
</head>
<body class="login-container flex items-center justify-center">
  <div class="login-box p-8 rounded-xl w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-800"><i class="fas fa-calendar-check mr-2"></i>\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF</h1>
      <p class="text-gray-600 mt-2">\u767B\u5F55\u7BA1\u7406\u60A8\u7684\u8BA2\u9605\u63D0\u9192</p>
    </div>
    
    <form id="loginForm" class="space-y-6">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
          <i class="fas fa-user mr-2"></i>\u7528\u6237\u540D
        </label>
        <input type="text" id="username" name="username" required
          class="input-field w-full px-4 py-3 rounded-lg text-gray-700 focus:outline-none">
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          <i class="fas fa-lock mr-2"></i>\u5BC6\u7801
        </label>
        <input type="password" id="password" name="password" required
          class="input-field w-full px-4 py-3 rounded-lg text-gray-700 focus:outline-none">
      </div>
      
      <button type="submit" 
        class="btn-primary w-full py-3 rounded-lg text-white font-medium focus:outline-none">
        <i class="fas fa-sign-in-alt mr-2"></i>\u767B\u5F55
      </button>
      
      <div id="errorMsg" class="text-red-500 text-center"></div>
    </form>
  </div>
  
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const button = e.target.querySelector('button');
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>\u767B\u5F55\u4E2D...';
      button.disabled = true;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
          window.location.href = '/admin';
        } else {
          document.getElementById('errorMsg').textContent = result.message || '\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF';
          button.innerHTML = originalContent;
          button.disabled = false;
        }
      } catch (error) {
        document.getElementById('errorMsg').textContent = '\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5';
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    });
  <\/script>
</body>
</html>
`;

// src/utils/auth.ts
var CryptoJS = {
  HmacSHA256: /* @__PURE__ */ __name(function(message, key) {
    const keyData = new TextEncoder().encode(key);
    const messageData = new TextEncoder().encode(message);
    return Promise.resolve().then(() => {
      return crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
      );
    }).then((cryptoKey) => {
      return crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageData
      );
    }).then((buffer) => {
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    });
  }, "HmacSHA256")
};
function generateRandomSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
__name(generateRandomSecret, "generateRandomSecret");
async function generateJWT(username, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { username, iat: Math.floor(Date.now() / 1e3) };
  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(payload));
  const signatureInput = headerBase64 + "." + payloadBase64;
  const signature = await CryptoJS.HmacSHA256(signatureInput, secret);
  return headerBase64 + "." + payloadBase64 + "." + signature;
}
__name(generateJWT, "generateJWT");
async function verifyJWT(token, secret) {
  try {
    if (!token || !secret) {
      console.log("[JWT] Token\u6216Secret\u4E3A\u7A7A");
      return null;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("[JWT] Token\u683C\u5F0F\u9519\u8BEF\uFF0C\u90E8\u5206\u6570\u91CF:", parts.length);
      return null;
    }
    const [headerBase64, payloadBase64, signature] = parts;
    const signatureInput = headerBase64 + "." + payloadBase64;
    const expectedSignature = await CryptoJS.HmacSHA256(signatureInput, secret);
    if (signature !== expectedSignature) {
      console.log("[JWT] \u7B7E\u540D\u9A8C\u8BC1\u5931\u8D25");
      return null;
    }
    const payload = JSON.parse(atob(payloadBase64));
    console.log("[JWT] \u9A8C\u8BC1\u6210\u529F\uFF0C\u7528\u6237:", payload.username);
    return payload;
  } catch (error) {
    console.error("[JWT] \u9A8C\u8BC1\u8FC7\u7A0B\u51FA\u9519:", error);
    return null;
  }
}
__name(verifyJWT, "verifyJWT");

// src/utils/config.ts
async function getRawConfig(env) {
  if (!env.SUBSCRIPTIONS_KV) {
    console.error("[\u914D\u7F6E] KV\u5B58\u50A8\u672A\u7ED1\u5B9A");
    return {};
  }
  const data = await env.SUBSCRIPTIONS_KV.get("config");
  return data ? JSON.parse(data) : {};
}
__name(getRawConfig, "getRawConfig");
async function getConfig(env) {
  try {
    const config = await getRawConfig(env);
    console.log("[\u914D\u7F6E] \u4ECEKV\u8BFB\u53D6\u914D\u7F6E:", Object.keys(config).length > 0 ? "\u6210\u529F" : "\u7A7A\u914D\u7F6E");
    let jwtSecret = config.JWT_SECRET;
    if (!jwtSecret || jwtSecret === "your-secret-key") {
      jwtSecret = generateRandomSecret();
      console.log("[\u914D\u7F6E] \u751F\u6210\u65B0\u7684JWT\u5BC6\u94A5");
      config.JWT_SECRET = jwtSecret;
      if (env.SUBSCRIPTIONS_KV) {
        await env.SUBSCRIPTIONS_KV.put("config", JSON.stringify(config));
      }
    }
    const finalConfig = {
      adminUsername: config.ADMIN_USERNAME || "admin",
      adminPassword: config.ADMIN_PASSWORD || "password",
      jwtSecret,
      timezone: config.TIMEZONE || "UTC",
      showLunarGlobal: config.SHOW_LUNAR === true,
      enabledNotifiers: config.ENABLED_NOTIFIERS || ["notifyx"],
      telegram: {
        botToken: config.TG_BOT_TOKEN || "",
        chatId: config.TG_CHAT_ID || ""
      },
      notifyx: {
        apiKey: config.NOTIFYX_API_KEY || ""
      },
      wenotify: {
        url: config.WENOTIFY_URL || "",
        token: config.WENOTIFY_TOKEN || "",
        userid: config.WENOTIFY_USERID || "",
        templateId: config.WENOTIFY_TEMPLATE_ID || ""
      },
      wechatBot: {
        webhook: config.WECHATBOT_WEBHOOK || "",
        msgType: config.WECHATBOT_MSG_TYPE || "text",
        atMobiles: config.WECHATBOT_AT_MOBILES || "",
        atAll: config.WECHATBOT_AT_ALL || "false"
      },
      webhook: {
        url: config.WEBHOOK_URL || "",
        method: config.WEBHOOK_METHOD || "POST",
        headers: config.WEBHOOK_HEADERS || "",
        template: config.WEBHOOK_TEMPLATE || ""
      },
      email: {
        resendApiKey: config.RESEND_API_KEY || "",
        fromEmail: config.EMAIL_FROM || "",
        toEmail: config.EMAIL_TO || ""
      },
      bark: {
        server: config.BARK_SERVER || "https://api.day.app",
        deviceKey: config.BARK_DEVICE_KEY || "",
        isArchive: config.BARK_IS_ARCHIVE || "false"
      }
    };
    return finalConfig;
  } catch (error) {
    console.error("[\u914D\u7F6E] \u83B7\u53D6\u914D\u7F6E\u5931\u8D25:", error);
    const defaultJwtSecret = generateRandomSecret();
    return {
      adminUsername: "admin",
      adminPassword: "password",
      jwtSecret: defaultJwtSecret,
      timezone: "UTC",
      showLunarGlobal: true,
      enabledNotifiers: ["notifyx"],
      telegram: { botToken: "", chatId: "" },
      notifyx: { apiKey: "" },
      wenotify: { url: "", token: "", userid: "", templateId: "" },
      wechatBot: { webhook: "", msgType: "text", atMobiles: "", atAll: "false" },
      webhook: { url: "", method: "POST", headers: "", template: "" },
      email: { resendApiKey: "", fromEmail: "", toEmail: "" },
      bark: { server: "https://api.day.app", deviceKey: "", isArchive: "false" }
    };
  }
}
__name(getConfig, "getConfig");

// src/templates/debug.ts
async function handleDebugRequest(request, env) {
  const url = new URL(request.url);
  try {
    const config = await getConfig(env);
    const debugInfo = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      pathname: url.pathname,
      kvBinding: !!env.SUBSCRIPTIONS_KV,
      configExists: !!config,
      adminUsername: config.adminUsername || "",
      hasJwtSecret: !!config.jwtSecret,
      jwtSecretLength: config.jwtSecret ? config.jwtSecret.length : 0
    };
    return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>\u8C03\u8BD5\u4FE1\u606F</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    .info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>\u7CFB\u7EDF\u8C03\u8BD5\u4FE1\u606F</h1>
  <div class="info">
    <h3>\u57FA\u672C\u4FE1\u606F</h3>
    <p>\u65F6\u95F4: ${debugInfo.timestamp}</p>
    <p>\u8DEF\u5F84: ${debugInfo.pathname}</p>
    <p class="${debugInfo.kvBinding ? "success" : "error"}">KV\u7ED1\u5B9A: ${debugInfo.kvBinding ? "\u2713" : "\u2717"}</p>
  </div>

  <div class="info">
    <h3>\u914D\u7F6E\u4FE1\u606F</h3>
    <p class="${debugInfo.configExists ? "success" : "error"}">\u914D\u7F6E\u5B58\u5728: ${debugInfo.configExists ? "\u2713" : "\u2717"}</p>
    <p>\u7BA1\u7406\u5458\u7528\u6237\u540D: ${debugInfo.adminUsername}</p>
    <p class="${debugInfo.hasJwtSecret ? "success" : "error"}">JWT\u5BC6\u94A5: ${debugInfo.hasJwtSecret ? "\u2713" : "\u2717"} (\u957F\u5EA6: ${debugInfo.jwtSecretLength})</p>
  </div>

  <div class="info">
    <h3>\u89E3\u51B3\u65B9\u6848</h3>
    <p>1. \u786E\u4FDDKV\u547D\u540D\u7A7A\u95F4\u5DF2\u6B63\u786E\u7ED1\u5B9A\u4E3A SUBSCRIPTIONS_KV</p>
    <p>2. \u5C1D\u8BD5\u8BBF\u95EE <a href="/">/</a> \u8FDB\u884C\u767B\u5F55</p>
    <p>3. \u5982\u679C\u4ECD\u6709\u95EE\u9898\uFF0C\u8BF7\u68C0\u67E5Cloudflare Workers\u65E5\u5FD7</p>
  </div>
</body>
</html>`, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (error) {
    return new Response(`\u8C03\u8BD5\u9875\u9762\u9519\u8BEF: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
__name(handleDebugRequest, "handleDebugRequest");

// src/utils/lunar.ts
var lunarCalendar = {
  // 农历数据 (1900-2100年)
  lunarInfo: [
    19416,
    19168,
    42352,
    21717,
    53856,
    55632,
    91476,
    22176,
    39632,
    21970,
    19168,
    42422,
    42192,
    53840,
    119381,
    46400,
    54944,
    44450,
    38320,
    84343,
    18800,
    42160,
    46261,
    27216,
    27968,
    109396,
    11104,
    38256,
    21234,
    18800,
    25958,
    54432,
    59984,
    28309,
    23248,
    11104,
    100067,
    37600,
    116951,
    51536,
    54432,
    120998,
    46416,
    22176,
    107956,
    9680,
    37584,
    53938,
    43344,
    46423,
    27808,
    46416,
    86869,
    19872,
    42416,
    83315,
    21168,
    43432,
    59728,
    27296,
    44710,
    43856,
    19296,
    43748,
    42352,
    21088,
    62051,
    55632,
    23383,
    22176,
    38608,
    19925,
    19152,
    42192,
    54484,
    53840,
    54616,
    46400,
    46752,
    103846,
    38320,
    18864,
    43380,
    42160,
    45690,
    27216,
    27968,
    44870,
    43872,
    38256,
    19189,
    18800,
    25776,
    29859,
    59984,
    27480,
    21952,
    43872,
    38613,
    37600,
    51552,
    55636,
    54432,
    55888,
    30034,
    22176,
    43959,
    9680,
    37584,
    51893,
    43344,
    46240,
    47780,
    44368,
    21977,
    19360,
    42416,
    86390,
    21168,
    43312,
    31060,
    27296,
    44368,
    23378,
    19296,
    42726,
    42208,
    53856,
    60005,
    54576,
    23200,
    30371,
    38608,
    19415,
    19152,
    42192,
    118966,
    53840,
    54560,
    56645,
    46496,
    22224,
    21938,
    18864,
    42359,
    42160,
    43600,
    111189,
    27936,
    44448
  ],
  // 天干地支
  gan: ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"],
  zhi: ["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"],
  // 农历月份
  months: ["\u6B63", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341", "\u51AC", "\u814A"],
  // 农历日期
  days: [
    "\u521D\u4E00",
    "\u521D\u4E8C",
    "\u521D\u4E09",
    "\u521D\u56DB",
    "\u521D\u4E94",
    "\u521D\u516D",
    "\u521D\u4E03",
    "\u521D\u516B",
    "\u521D\u4E5D",
    "\u521D\u5341",
    "\u5341\u4E00",
    "\u5341\u4E8C",
    "\u5341\u4E09",
    "\u5341\u56DB",
    "\u5341\u4E94",
    "\u5341\u516D",
    "\u5341\u4E03",
    "\u5341\u516B",
    "\u5341\u4E5D",
    "\u4E8C\u5341",
    "\u5EFF\u4E00",
    "\u5EFF\u4E8C",
    "\u5EFF\u4E09",
    "\u5EFF\u56DB",
    "\u5EFF\u4E94",
    "\u5EFF\u516D",
    "\u5EFF\u4E03",
    "\u5EFF\u516B",
    "\u5EFF\u4E5D",
    "\u4E09\u5341"
  ],
  // 获取农历年天数
  lunarYearDays: /* @__PURE__ */ __name(function(year) {
    let sum = 348;
    for (let i = 32768; i > 8; i >>= 1) {
      sum += this.lunarInfo[year - 1900] & i ? 1 : 0;
    }
    return sum + this.leapDays(year);
  }, "lunarYearDays"),
  // 获取闰月天数
  leapDays: /* @__PURE__ */ __name(function(year) {
    if (this.leapMonth(year)) {
      return this.lunarInfo[year - 1900] & 65536 ? 30 : 29;
    }
    return 0;
  }, "leapDays"),
  // 获取闰月月份
  leapMonth: /* @__PURE__ */ __name(function(year) {
    return this.lunarInfo[year - 1900] & 15;
  }, "leapMonth"),
  // 获取农历月天数
  monthDays: /* @__PURE__ */ __name(function(year, month) {
    return this.lunarInfo[year - 1900] & 65536 >> month ? 30 : 29;
  }, "monthDays"),
  // 公历转农历
  solar2lunar: /* @__PURE__ */ __name(function(year, month, day) {
    if (year < 1900 || year > 2100) return null;
    const baseDate = new Date(1900, 0, 31);
    const objDate = new Date(year, month - 1, day);
    let offset = Math.round((objDate.getTime() - baseDate.getTime()) / 864e5);
    let temp = 0;
    let lunarYear = 1900;
    for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
      temp = this.lunarYearDays(lunarYear);
      offset -= temp;
    }
    if (offset < 0) {
      offset += temp;
      lunarYear--;
    }
    let lunarMonth = 1;
    let leap = this.leapMonth(lunarYear);
    let isLeap = false;
    for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
      if (leap > 0 && lunarMonth === leap + 1 && !isLeap) {
        --lunarMonth;
        isLeap = true;
        temp = this.leapDays(lunarYear);
      } else {
        temp = this.monthDays(lunarYear, lunarMonth);
      }
      if (isLeap && lunarMonth === leap + 1) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --lunarMonth;
      }
    }
    if (offset < 0) {
      offset += temp;
      --lunarMonth;
    }
    const lunarDay = offset + 1;
    const ganIndex = (lunarYear - 4) % 10;
    const zhiIndex = (lunarYear - 4) % 12;
    const yearStr = this.gan[ganIndex] + this.zhi[zhiIndex] + "\u5E74";
    const monthStr = (isLeap ? "\u95F0" : "") + this.months[lunarMonth - 1] + "\u6708";
    const dayStr = this.days[lunarDay - 1];
    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap,
      yearStr,
      monthStr,
      dayStr,
      fullStr: yearStr + monthStr + dayStr
    };
  }, "solar2lunar")
};
function addLunarPeriod(lunar, periodValue, periodUnit) {
  let { year, month, day, isLeap } = lunar;
  if (periodUnit === "year") {
    year += periodValue;
    const leap = lunarCalendar.leapMonth(year);
    if (isLeap && leap === month) {
      isLeap = true;
    } else {
      isLeap = false;
    }
  } else if (periodUnit === "month") {
    let totalMonths = (year - 1900) * 12 + (month - 1) + periodValue;
    year = Math.floor(totalMonths / 12) + 1900;
    month = totalMonths % 12 + 1;
    const leap = lunarCalendar.leapMonth(year);
    if (isLeap && leap === month) {
      isLeap = true;
    } else {
      isLeap = false;
    }
  } else if (periodUnit === "day") {
    const solar = lunar2solar(lunar);
    if (solar) {
      const date = new Date(solar.year, solar.month - 1, solar.day + periodValue);
      const newLunar = lunarCalendar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
      if (newLunar) return { year: newLunar.year, month: newLunar.month, day: newLunar.day, isLeap: newLunar.isLeap };
    }
    return lunar;
  }
  let maxDay = isLeap ? lunarCalendar.leapDays(year) : lunarCalendar.monthDays(year, month);
  let targetDay = Math.min(day, maxDay);
  while (targetDay > 0) {
    let solar = lunar2solar({ year, month, day: targetDay, isLeap });
    if (solar) {
      return { year, month, day: targetDay, isLeap };
    }
    targetDay--;
  }
  return { year, month, day, isLeap };
}
__name(addLunarPeriod, "addLunarPeriod");
function lunar2solar(lunar) {
  for (let y = lunar.year - 1; y <= lunar.year + 1; y++) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) continue;
        const l = lunarCalendar.solar2lunar(y, m, d);
        if (l && l.year === lunar.year && l.month === lunar.month && l.day === lunar.day && l.isLeap === lunar.isLeap) {
          return { year: y, month: m, day: d };
        }
      }
    }
  }
  return null;
}
__name(lunar2solar, "lunar2solar");
var lunarBiz = {
  lunar2solar,
  addLunarPeriod
};

// src/utils/date.ts
function getCurrentTimeInTimezone(timezone = "UTC") {
  try {
    return /* @__PURE__ */ new Date();
  } catch (error) {
    console.error(`\u65F6\u533A\u8F6C\u6362\u9519\u8BEF: ${error.message}`);
    return /* @__PURE__ */ new Date();
  }
}
__name(getCurrentTimeInTimezone, "getCurrentTimeInTimezone");
function formatTimeInTimezone(time, timezone = "UTC", format = "full") {
  try {
    const date = new Date(time);
    if (format === "date") {
      return date.toLocaleDateString("zh-CN", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    } else if (format === "datetime") {
      return date.toLocaleString("zh-CN", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } else {
      return date.toLocaleString("zh-CN", {
        timeZone: timezone
      });
    }
  } catch (error) {
    console.error(`\u65F6\u95F4\u683C\u5F0F\u5316\u9519\u8BEF: ${error.message}`);
    return new Date(time).toISOString();
  }
}
__name(formatTimeInTimezone, "formatTimeInTimezone");
function getTimezoneOffset(timezone = "UTC") {
  try {
    const now = /* @__PURE__ */ new Date();
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const parts = dtf.formatToParts(now);
    const get = /* @__PURE__ */ __name((type) => Number(parts.find((x) => x.type === type)?.value), "get");
    const target = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    const utc = now.getTime();
    return Math.round((target - utc) / (1e3 * 60 * 60));
  } catch (error) {
    console.error(`\u83B7\u53D6\u65F6\u533A\u504F\u79FB\u91CF\u9519\u8BEF: ${error.message}`);
    return 0;
  }
}
__name(getTimezoneOffset, "getTimezoneOffset");
function formatTimezoneDisplay(timezone = "UTC") {
  try {
    const offset = getTimezoneOffset(timezone);
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    const timezoneNames = {
      "UTC": "\u4E16\u754C\u6807\u51C6\u65F6\u95F4",
      "Asia/Shanghai": "\u4E2D\u56FD\u6807\u51C6\u65F6\u95F4",
      "Asia/Hong_Kong": "\u9999\u6E2F\u65F6\u95F4",
      "Asia/Taipei": "\u53F0\u5317\u65F6\u95F4",
      "Asia/Singapore": "\u65B0\u52A0\u5761\u65F6\u95F4",
      "Asia/Tokyo": "\u65E5\u672C\u65F6\u95F4",
      "Asia/Seoul": "\u97E9\u56FD\u65F6\u95F4",
      "America/New_York": "\u7F8E\u56FD\u4E1C\u90E8\u65F6\u95F4",
      "America/Los_Angeles": "\u7F8E\u56FD\u592A\u5E73\u6D0B\u65F6\u95F4",
      "America/Chicago": "\u7F8E\u56FD\u4E2D\u90E8\u65F6\u95F4",
      "America/Denver": "\u7F8E\u56FD\u5C71\u5730\u65F6\u95F4",
      "Europe/London": "\u82F1\u56FD\u65F6\u95F4",
      "Europe/Paris": "\u5DF4\u9ECE\u65F6\u95F4",
      "Europe/Berlin": "\u67CF\u6797\u65F6\u95F4",
      "Europe/Moscow": "\u83AB\u65AF\u79D1\u65F6\u95F4",
      "Australia/Sydney": "\u6089\u5C3C\u65F6\u95F4",
      "Australia/Melbourne": "\u58A8\u5C14\u672C\u65F6\u95F4",
      "Pacific/Auckland": "\u5965\u514B\u5170\u65F6\u95F4"
    };
    const timezoneName = timezoneNames[timezone] || timezone;
    return `${timezoneName} (UTC${offsetStr})`;
  } catch (error) {
    console.error("\u683C\u5F0F\u5316\u65F6\u533A\u663E\u793A\u5931\u8D25:", error);
    return timezone;
  }
}
__name(formatTimezoneDisplay, "formatTimezoneDisplay");

// src/services/subscription.ts
var SubscriptionService = class {
  constructor(env) {
    this.env = env;
  }
  static {
    __name(this, "SubscriptionService");
  }
  async getAllSubscriptions() {
    if (!this.env.SUBSCRIPTIONS_KV) return [];
    const data = await this.env.SUBSCRIPTIONS_KV.get("subscriptions");
    return data ? JSON.parse(data) : [];
  }
  async getSubscription(id) {
    const subscriptions = await this.getAllSubscriptions();
    return subscriptions.find((s) => s.id === id);
  }
  async createSubscription(subscription) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const config = await getConfig(this.env);
      const timezone = config.timezone || "UTC";
      const currentTime = getCurrentTimeInTimezone(timezone);
      if (!subscription.name || !subscription.expiryDate) {
        return { success: false, message: "\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5" };
      }
      let expiryDate = new Date(subscription.expiryDate);
      let useLunar = !!subscription.useLunar;
      if (useLunar) {
        let lunar = lunarCalendar.solar2lunar(
          expiryDate.getFullYear(),
          expiryDate.getMonth() + 1,
          expiryDate.getDate()
        );
        if (!lunar) {
          return { success: false, message: "\u519C\u5386\u65E5\u671F\u8D85\u51FA\u652F\u6301\u8303\u56F4\uFF081900-2100\u5E74\uFF09" };
        }
        if (subscription.periodValue && subscription.periodUnit) {
          while (expiryDate <= currentTime) {
            lunar = lunarBiz.addLunarPeriod(lunar, subscription.periodValue, subscription.periodUnit);
            const solar = lunarBiz.lunar2solar(lunar);
            if (!solar) break;
            expiryDate = new Date(solar.year, solar.month - 1, solar.day);
          }
          subscription.expiryDate = expiryDate.toISOString();
        }
      } else {
        if (expiryDate < currentTime && subscription.periodValue && subscription.periodUnit) {
          while (expiryDate < currentTime) {
            if (subscription.periodUnit === "day") {
              expiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
            } else if (subscription.periodUnit === "month") {
              expiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
            } else if (subscription.periodUnit === "year") {
              expiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
            }
          }
          subscription.expiryDate = expiryDate.toISOString();
        }
      }
      const newSubscription = {
        id: Date.now().toString(),
        name: subscription.name,
        customType: subscription.customType || "",
        startDate: subscription.startDate || null,
        expiryDate: subscription.expiryDate,
        periodValue: subscription.periodValue || 1,
        periodUnit: subscription.periodUnit || "month",
        reminderDays: subscription.reminderDays !== void 0 ? subscription.reminderDays : 7,
        notes: subscription.notes || "",
        isActive: subscription.isActive !== false,
        autoRenew: subscription.autoRenew !== false,
        useLunar,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      subscriptions.push(newSubscription);
      await this.env.SUBSCRIPTIONS_KV.put("subscriptions", JSON.stringify(subscriptions));
      return { success: true, subscription: newSubscription };
    } catch (error) {
      console.error("\u521B\u5EFA\u8BA2\u9605\u5F02\u5E38\uFF1A", error);
      return { success: false, message: error.message || "\u521B\u5EFA\u8BA2\u9605\u5931\u8D25" };
    }
  }
  async updateSubscription(id, subscription) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex((s) => s.id === id);
      if (index === -1) {
        return { success: false, message: "\u8BA2\u9605\u4E0D\u5B58\u5728" };
      }
      if (!subscription.name || !subscription.expiryDate) {
        return { success: false, message: "\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5" };
      }
      let expiryDate = new Date(subscription.expiryDate);
      const config = await getConfig(this.env);
      const timezone = config.timezone || "UTC";
      const currentTime = getCurrentTimeInTimezone(timezone);
      let useLunar = !!subscription.useLunar;
      if (useLunar) {
        let lunar = lunarCalendar.solar2lunar(
          expiryDate.getFullYear(),
          expiryDate.getMonth() + 1,
          expiryDate.getDate()
        );
        if (!lunar) return { success: false, message: "\u519C\u5386\u65E5\u671F\u8D85\u51FA\u652F\u6301\u8303\u56F4" };
        if (expiryDate < currentTime && subscription.periodValue && subscription.periodUnit) {
          do {
            lunar = lunarBiz.addLunarPeriod(lunar, subscription.periodValue, subscription.periodUnit);
            const solar = lunarBiz.lunar2solar(lunar);
            if (!solar) break;
            expiryDate = new Date(solar.year, solar.month - 1, solar.day);
          } while (expiryDate < currentTime);
          subscription.expiryDate = expiryDate.toISOString();
        }
      } else {
        if (expiryDate < currentTime && subscription.periodValue && subscription.periodUnit) {
          while (expiryDate < currentTime) {
            if (subscription.periodUnit === "day") {
              expiryDate.setDate(expiryDate.getDate() + subscription.periodValue);
            } else if (subscription.periodUnit === "month") {
              expiryDate.setMonth(expiryDate.getMonth() + subscription.periodValue);
            } else if (subscription.periodUnit === "year") {
              expiryDate.setFullYear(expiryDate.getFullYear() + subscription.periodValue);
            }
          }
          subscription.expiryDate = expiryDate.toISOString();
        }
      }
      subscriptions[index] = {
        ...subscriptions[index],
        name: subscription.name,
        customType: subscription.customType || subscriptions[index].customType || "",
        startDate: subscription.startDate || subscriptions[index].startDate,
        expiryDate: subscription.expiryDate,
        periodValue: subscription.periodValue || subscriptions[index].periodValue || 1,
        periodUnit: subscription.periodUnit || subscriptions[index].periodUnit || "month",
        reminderDays: subscription.reminderDays !== void 0 ? subscription.reminderDays : subscriptions[index].reminderDays,
        notes: subscription.notes || "",
        isActive: subscription.isActive !== void 0 ? subscription.isActive : subscriptions[index].isActive,
        autoRenew: subscription.autoRenew !== void 0 ? subscription.autoRenew : subscriptions[index].autoRenew,
        useLunar,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.env.SUBSCRIPTIONS_KV.put("subscriptions", JSON.stringify(subscriptions));
      return { success: true, subscription: subscriptions[index] };
    } catch (error) {
      return { success: false, message: "\u66F4\u65B0\u8BA2\u9605\u5931\u8D25" };
    }
  }
  async deleteSubscription(id) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const filtered = subscriptions.filter((s) => s.id !== id);
      if (filtered.length === subscriptions.length) {
        return { success: false, message: "\u8BA2\u9605\u4E0D\u5B58\u5728" };
      }
      await this.env.SUBSCRIPTIONS_KV.put("subscriptions", JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, message: "\u5220\u9664\u8BA2\u9605\u5931\u8D25" };
    }
  }
  async toggleSubscriptionStatus(id, isActive) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      const index = subscriptions.findIndex((s) => s.id === id);
      if (index === -1) return { success: false, message: "\u8BA2\u9605\u4E0D\u5B58\u5728" };
      subscriptions[index] = {
        ...subscriptions[index],
        isActive,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await this.env.SUBSCRIPTIONS_KV.put("subscriptions", JSON.stringify(subscriptions));
      return { success: true, subscription: subscriptions[index] };
    } catch (error) {
      return { success: false, message: "\u66F4\u65B0\u72B6\u6001\u5931\u8D25" };
    }
  }
  async checkExpiringSubscriptions() {
    const subscriptions = await this.getAllSubscriptions();
    const config = await getConfig(this.env);
    const timezone = config.timezone || "UTC";
    const currentTime = getCurrentTimeInTimezone(timezone);
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const notifications = [];
    let hasUpdates = false;
    for (let i = 0; i < subscriptions.length; i++) {
      let sub = subscriptions[i];
      if (!sub.isActive) continue;
      let expiryDate = new Date(sub.expiryDate);
      const expiryCheck = new Date(expiryDate);
      expiryCheck.setHours(0, 0, 0, 0);
      const diffTime = expiryCheck.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      if (daysRemaining < 0 && sub.autoRenew) {
        console.log(`[AutoRenew] Renewing subscription: ${sub.name}`);
        if (sub.useLunar) {
          const currentLunar = lunarCalendar.solar2lunar(
            expiryDate.getFullYear(),
            expiryDate.getMonth() + 1,
            expiryDate.getDate()
          );
          if (currentLunar) {
            let nextLunar = currentLunar;
            let nextSolarDate = expiryDate;
            do {
              nextLunar = lunarBiz.addLunarPeriod(nextLunar, sub.periodValue || 1, sub.periodUnit || "month");
              const solar = lunarBiz.lunar2solar(nextLunar);
              if (!solar) break;
              nextSolarDate = new Date(solar.year, solar.month - 1, solar.day);
            } while (nextSolarDate < today);
            sub.expiryDate = nextSolarDate.toISOString();
          }
        } else {
          do {
            if (sub.periodUnit === "day") {
              expiryDate.setDate(expiryDate.getDate() + (sub.periodValue || 1));
            } else if (sub.periodUnit === "month") {
              expiryDate.setMonth(expiryDate.getMonth() + (sub.periodValue || 1));
            } else if (sub.periodUnit === "year") {
              expiryDate.setFullYear(expiryDate.getFullYear() + (sub.periodValue || 1));
            }
          } while (expiryDate < today);
          sub.expiryDate = expiryDate.toISOString();
        }
        sub.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        subscriptions[i] = sub;
        hasUpdates = true;
        const newExpiry = new Date(sub.expiryDate);
        newExpiry.setHours(0, 0, 0, 0);
        const newDiff = newExpiry.getTime() - today.getTime();
        const newDaysRemaining = Math.ceil(newDiff / (1e3 * 60 * 60 * 24));
        if (newDaysRemaining <= (sub.reminderDays || 7) && newDaysRemaining >= 0) {
          notifications.push({ subscription: sub, daysUntil: newDaysRemaining });
        }
      } else {
        if (daysRemaining <= (sub.reminderDays || 7) && daysRemaining >= 0) {
          notifications.push({ subscription: sub, daysUntil: daysRemaining });
        } else if (daysRemaining < 0) {
          notifications.push({ subscription: sub, daysUntil: daysRemaining });
        }
      }
    }
    if (hasUpdates) {
      await this.env.SUBSCRIPTIONS_KV.put("subscriptions", JSON.stringify(subscriptions));
    }
    return { notifications };
  }
};

// src/services/notification.ts
function formatNotificationContent(subscriptions, config) {
  const showLunar = config.showLunarGlobal === true;
  const timezone = config.timezone || "UTC";
  let content = "";
  for (const sub of subscriptions) {
    const typeText = sub.customType || "\u5176\u4ED6";
    const periodText = sub.periodValue && sub.periodUnit ? `(\u5468\u671F: ${sub.periodValue} ${{ day: "\u5929", month: "\u6708", year: "\u5E74" }[sub.periodUnit] || sub.periodUnit})` : "";
    const expiryDateObj = new Date(sub.expiryDate);
    const formattedExpiryDate = formatTimeInTimezone(expiryDateObj, timezone, "date");
    let lunarExpiryText = "";
    if (showLunar) {
      const lunarExpiry = lunarCalendar.solar2lunar(expiryDateObj.getFullYear(), expiryDateObj.getMonth() + 1, expiryDateObj.getDate());
      lunarExpiryText = lunarExpiry ? `
\u519C\u5386\u65E5\u671F: ${lunarExpiry.fullStr}` : "";
    }
    let statusText = "";
    let statusEmoji = "";
    if (sub.daysRemaining === 0) {
      statusEmoji = "\u26A0\uFE0F";
      statusText = "\u4ECA\u5929\u5230\u671F\uFF01";
    } else if (sub.daysRemaining !== void 0 && sub.daysRemaining < 0) {
      statusEmoji = "\u{1F6A8}";
      statusText = `\u5DF2\u8FC7\u671F ${Math.abs(sub.daysRemaining)} \u5929`;
    } else {
      statusEmoji = "\u{1F4C5}";
      statusText = `\u5C06\u5728 ${sub.daysRemaining} \u5929\u540E\u5230\u671F`;
    }
    const calendarType = sub.useLunar ? "\u519C\u5386" : "\u516C\u5386";
    const autoRenewText = sub.autoRenew ? "\u662F" : "\u5426";
    const subscriptionContent = `${statusEmoji} **${sub.name}**
\u7C7B\u578B: ${typeText} ${periodText}
\u65E5\u5386\u7C7B\u578B: ${calendarType}
\u5230\u671F\u65E5\u671F: ${formattedExpiryDate}${lunarExpiryText}
\u81EA\u52A8\u7EED\u671F: ${autoRenewText}
\u5230\u671F\u72B6\u6001: ${statusText}`;
    let finalContent = sub.notes ? subscriptionContent + `
\u5907\u6CE8: ${sub.notes}` : subscriptionContent;
    content += finalContent + "\n\n";
  }
  const currentTime = formatTimeInTimezone(/* @__PURE__ */ new Date(), timezone, "datetime");
  content += `\u53D1\u9001\u65F6\u95F4: ${currentTime}
\u5F53\u524D\u65F6\u533A: ${formatTimezoneDisplay(timezone)}`;
  return content;
}
__name(formatNotificationContent, "formatNotificationContent");
async function sendNotificationToAllChannels(title, commonContent, config, logPrefix = "[\u5B9A\u65F6\u4EFB\u52A1]") {
  if (!config.enabledNotifiers || config.enabledNotifiers.length === 0) {
    console.log(`${logPrefix} \u672A\u542F\u7528\u4EFB\u4F55\u901A\u77E5\u6E20\u9053\u3002`);
    return;
  }
  if (config.enabledNotifiers.includes("notifyx")) {
    const notifyxContent = `## ${title}

${commonContent}`;
    const success = await sendNotifyXNotification(title, notifyxContent, `\u8BA2\u9605\u63D0\u9192`, config);
    console.log(`${logPrefix} \u53D1\u9001NotifyX\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("wenotify")) {
    const wenotifyContent = commonContent.replace(/(\**|\*|##|#|`)/g, "");
    const success = await sendWeNotifyEdgeNotification(title, wenotifyContent, config);
    console.log(`${logPrefix} \u53D1\u9001WeNotify Edge\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("telegram")) {
    const telegramContent = `*${title}*

${commonContent}`;
    const success = await sendTelegramNotification(telegramContent, config);
    console.log(`${logPrefix} \u53D1\u9001Telegram\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("webhook")) {
    const webhookContent = commonContent.replace(/(\**|\*|##|#|`)/g, "");
    const success = await sendWebhookNotification(title, webhookContent, config);
    console.log(`${logPrefix} \u53D1\u9001\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("wechatbot")) {
    const wechatbotContent = commonContent.replace(/(\**|\*|##|#|`)/g, "");
    const success = await sendWechatBotNotification(title, wechatbotContent, config);
    console.log(`${logPrefix} \u53D1\u9001\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("email")) {
    const emailContent = commonContent.replace(/(\**|\*|##|#|`)/g, "");
    const success = await sendEmailNotification(title, emailContent, config);
    console.log(`${logPrefix} \u53D1\u9001\u90AE\u4EF6\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
  if (config.enabledNotifiers.includes("bark")) {
    const barkContent = commonContent.replace(/(\**|\*|##|#|`)/g, "");
    const success = await sendBarkNotification(title, barkContent, config);
    console.log(`${logPrefix} \u53D1\u9001Bark\u901A\u77E5 ${success ? "\u6210\u529F" : "\u5931\u8D25"}`);
  }
}
__name(sendNotificationToAllChannels, "sendNotificationToAllChannels");
async function sendTelegramNotification(message, config) {
  try {
    if (!config.telegram?.botToken || !config.telegram?.chatId) {
      console.error("[Telegram] \u901A\u77E5\u672A\u914D\u7F6E\uFF0C\u7F3A\u5C11Bot Token\u6216Chat ID");
      return false;
    }
    const url = "https://api.telegram.org/bot" + config.telegram.botToken + "/sendMessage";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("[Telegram] \u53D1\u9001\u901A\u77E5\u5931\u8D25:", error);
    return false;
  }
}
__name(sendTelegramNotification, "sendTelegramNotification");
async function sendNotifyXNotification(title, content, description, config) {
  try {
    if (!config.notifyx?.apiKey) {
      console.error("[NotifyX] \u901A\u77E5\u672A\u914D\u7F6E\uFF0C\u7F3A\u5C11API Key");
      return false;
    }
    const url = "https://www.notifyx.cn/api/v1/send/" + config.notifyx.apiKey;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        description: description || ""
      })
    });
    const result = await response.json();
    return result.status === "queued";
  } catch (error) {
    console.error("[NotifyX] \u53D1\u9001\u901A\u77E5\u5931\u8D25:", error);
    return false;
  }
}
__name(sendNotifyXNotification, "sendNotifyXNotification");
async function sendWeNotifyEdgeNotification(title, content, config) {
  try {
    if (!config.wenotify?.url || !config.wenotify?.token) {
      console.error("[WeNotify Edge] \u901A\u77E5\u672A\u914D\u7F6E\uFF0C\u7F3A\u5C11\u670D\u52A1\u5730\u5740\u6216Token");
      return false;
    }
    let base = config.wenotify.url.trim().replace(/\/+$/, "");
    let url = base.endsWith("/wxsend") ? base : base + "/wxsend";
    const body = {
      title,
      content
    };
    if (config.wenotify.userid) {
      body.userid = config.wenotify.userid;
    }
    if (config.wenotify.templateId) {
      body.template_id = config.wenotify.templateId;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + config.wenotify.token
      },
      body: JSON.stringify(body)
    });
    return response.ok;
  } catch (error) {
    console.error("[WeNotify Edge] \u53D1\u9001\u901A\u77E5\u5931\u8D25:", error);
    return false;
  }
}
__name(sendWeNotifyEdgeNotification, "sendWeNotifyEdgeNotification");
async function sendBarkNotification(title, content, config) {
  try {
    if (!config.bark?.deviceKey) {
      console.error("[Bark] \u901A\u77E5\u672A\u914D\u7F6E\uFF0C\u7F3A\u5C11\u8BBE\u5907Key");
      return false;
    }
    const serverUrl = config.bark.server || "https://api.day.app";
    const url = serverUrl + "/push";
    const payload = {
      title,
      body: content,
      device_key: config.bark.deviceKey
    };
    if (config.bark.isArchive === "true") {
      payload.isArchive = 1;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.code === 200;
  } catch (error) {
    console.error("[Bark] \u53D1\u9001\u901A\u77E5\u5931\u8D25:", error);
    return false;
  }
}
__name(sendBarkNotification, "sendBarkNotification");
async function sendEmailNotification(title, content, config) {
  try {
    if (!config.email?.resendApiKey || !config.email?.fromEmail || !config.email?.toEmail) {
      console.error("[\u90AE\u4EF6\u901A\u77E5] \u901A\u77E5\u672A\u914D\u7F6E\uFF0C\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570");
      return false;
    }
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .content h2 { color: #333; margin-top: 0; }
        .content p { color: #666; line-height: 1.6; margin: 16px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>\u{1F4C5} ${title}</h1>
        </div>
        <div class="content">
            <div class="highlight">
                ${content.replace(/\n/g, "<br>")}
            </div>
            <p>\u6B64\u90AE\u4EF6\u7531\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u53CA\u65F6\u5904\u7406\u76F8\u5173\u8BA2\u9605\u4E8B\u52A1\u3002</p>
        </div>
        <div class="footer">
            <p>\u8BA2\u9605\u7BA1\u7406\u7CFB\u7EDF | \u53D1\u9001\u65F6\u95F4: ${formatTimeInTimezone(/* @__PURE__ */ new Date(), config.timezone || "UTC", "datetime")}</p>
        </div>
    </div>
</body>
</html>`;
    const fromEmail = config.email.fromEmail.includes("<") ? config.email.fromEmail : config.email.fromEmail ? `Notification <${config.email.fromEmail}>` : "";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.email.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: config.email.toEmail,
        subject: title,
        html: htmlContent,
        text: content
      })
    });
    const result = await response.json();
    return response.ok && result.id;
  } catch (error) {
    console.error("[\u90AE\u4EF6\u901A\u77E5] \u53D1\u9001\u90AE\u4EF6\u5931\u8D25:", error);
    return false;
  }
}
__name(sendEmailNotification, "sendEmailNotification");
async function sendWebhookNotification(title, content, config) {
  try {
    if (!config.webhook?.url) {
      console.error("[\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5] \u672A\u914D\u7F6E Webhook URL");
      return false;
    }
    const method = config.webhook.method || "POST";
    const headers = config.webhook.headers ? JSON.parse(config.webhook.headers) : { "Content-Type": "application/json" };
    const template = config.webhook.template ? JSON.parse(config.webhook.template) : null;
    let body;
    if (template) {
      const templateStr = JSON.stringify(template);
      const replacedStr = templateStr.replace(/{{title}}/g, title).replace(/{{content}}/g, content).replace(/{{timestamp}}/g, (/* @__PURE__ */ new Date()).toISOString());
      body = replacedStr;
    } else {
      body = JSON.stringify({
        msgtype: "text",
        text: {
          content: `${title}

${content}`
        }
      });
    }
    const response = await fetch(config.webhook.url, {
      method,
      headers,
      body: method !== "GET" ? body : void 0
    });
    return response.ok;
  } catch (error) {
    console.error("[\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528\u901A\u77E5] \u53D1\u9001\u5931\u8D25:", error);
    return false;
  }
}
__name(sendWebhookNotification, "sendWebhookNotification");
async function sendWechatBotNotification(title, content, config) {
  try {
    if (!config.wechatBot?.webhook) {
      console.error("[\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA] \u672A\u914D\u7F6E Webhook URL");
      return false;
    }
    const msgType = config.wechatBot.msgType || "text";
    let messageData;
    if (msgType === "markdown") {
      const markdownContent = `### ${title}

${content}`;
      messageData = {
        msgtype: "markdown",
        markdown: {
          content: markdownContent
        }
      };
    } else {
      const textContent = `${title}

${content}`;
      messageData = {
        msgtype: "text",
        text: {
          content: textContent
        }
      };
    }
    if (config.wechatBot.atAll === "true") {
      if (msgType === "text") {
        messageData.text.mentioned_list = ["@all"];
      }
    } else if (config.wechatBot.atMobiles) {
      const mobiles = config.wechatBot.atMobiles.split(",").map((m) => m.trim()).filter((m) => m);
      if (mobiles.length > 0) {
        if (msgType === "text") {
          messageData.text.mentioned_mobile_list = mobiles;
        }
      }
    }
    const response = await fetch(config.wechatBot.webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageData)
    });
    const responseText = await response.text();
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        return result.errcode === 0;
      } catch (parseError) {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error("[\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA] \u53D1\u9001\u901A\u77E5\u5931\u8D25:", error);
    return false;
  }
}
__name(sendWechatBotNotification, "sendWechatBotNotification");

// src/utils/http.ts
function getCookieValue(cookieString, key) {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp("(^| )" + key + "=([^;]+)"));
  return match ? match[2] : null;
}
__name(getCookieValue, "getCookieValue");

// src/worker.ts
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/debug") {
      return handleDebugRequest(request, env);
    }
    if (url.pathname.startsWith("/api")) {
      return handleApiRequest(request, env);
    }
    if (url.pathname.startsWith("/admin")) {
      return handleAdminRequest(request, env);
    }
    return handleMainRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    const config = await getConfig(env);
    const timezone = config.timezone || "UTC";
    const currentTime = getCurrentTimeInTimezone(timezone);
    console.log("[Workers] \u5B9A\u65F6\u4EFB\u52A1\u89E6\u53D1 UTC:", (/* @__PURE__ */ new Date()).toISOString(), timezone + ":", currentTime.toLocaleString("zh-CN", { timeZone: timezone }));
    const subscriptionService = new SubscriptionService(env);
    const { notifications } = await subscriptionService.checkExpiringSubscriptions();
    if (notifications.length > 0) {
      notifications.sort((a, b) => a.daysUntil - b.daysUntil);
      const subscriptions = notifications.map((n) => ({
        ...n.subscription,
        daysRemaining: n.daysUntil
      }));
      const commonContent = formatNotificationContent(subscriptions, config);
      const title = "\u8BA2\u9605\u5230\u671F\u63D0\u9192";
      await sendNotificationToAllChannels(title, commonContent, config, "[\u5B9A\u65F6\u4EFB\u52A1]");
    }
  }
};
async function handleMainRequest(request, env) {
  return new Response(loginPage, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(handleMainRequest, "handleMainRequest");
async function handleAdminRequest(request, env) {
  try {
    const url = new URL(request.url);
    const token = getCookieValue(request.headers.get("Cookie"), "token");
    const config = await getConfig(env);
    const user = token ? await verifyJWT(token, config.jwtSecret) : null;
    if (!user) {
      return new Response("", {
        status: 302,
        headers: { "Location": "/" }
      });
    }
    if (url.pathname === "/admin/config") {
      return new Response(configPage, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    return new Response(adminPage, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (error) {
    console.error("[Admin] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
__name(handleAdminRequest, "handleAdminRequest");
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.slice(4);
  const method = request.method;
  const config = await getConfig(env);
  if (path === "/dev/reset-login" && method === "POST") {
    try {
      const url2 = new URL(request.url);
      const isLocal = url2.hostname === "127.0.0.1" || url2.hostname === "localhost";
      if (!isLocal) {
        return new Response(JSON.stringify({ success: false, message: "\u4EC5\u9650\u672C\u5730\u5F00\u53D1\u4F7F\u7528" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
      const raw = await getRawConfig(env);
      raw.ADMIN_USERNAME = "admin";
      raw.ADMIN_PASSWORD = "password";
      if (!raw.JWT_SECRET) {
        raw.JWT_SECRET = generateRandomSecret();
      }
      await env.SUBSCRIPTIONS_KV.put("config", JSON.stringify(raw));
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
  if (path === "/login" && method === "POST") {
    try {
      const body = await request.json();
      const expectedUser = config.adminUsername || "admin";
      const expectedPass = config.adminPassword || "password";
      const inputUser = (body.username || "").toString();
      const inputPass = (body.password || "").toString();
      const ok = inputUser === expectedUser && inputPass === expectedPass;
      if (ok) {
        const token2 = await generateJWT(body.username, config.jwtSecret);
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `token=${token2}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`
          }
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: "Invalid request" }), { status: 400 });
    }
  }
  if (path === "/logout" && (method === "GET" || method === "POST")) {
    return new Response("", {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": "token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0"
      }
    });
  }
  if (path.startsWith("/notify/")) {
    if (method === "POST") {
      try {
        const body = await request.json();
        const title = body.title || "\u7B2C\u4E09\u65B9\u901A\u77E5";
        const content = body.content || "";
        if (!content) {
          return new Response(JSON.stringify({ message: "\u7F3A\u5C11\u5FC5\u586B\u53C2\u6570 content" }), { status: 400 });
        }
        await sendNotificationToAllChannels(title, content, config, "[\u7B2C\u4E09\u65B9API]");
        return new Response(JSON.stringify({
          message: "\u53D1\u9001\u6210\u529F",
          response: { errcode: 0, errmsg: "ok", msgid: "MSGID" + Date.now() }
        }), { headers: { "Content-Type": "application/json" } });
      } catch (error) {
        return new Response(JSON.stringify({
          message: "\u53D1\u9001\u5931\u8D25",
          response: { errcode: 1, errmsg: error.message }
        }), { status: 500 });
      }
    }
  }
  const token = getCookieValue(request.headers.get("Cookie"), "token");
  const user = token ? await verifyJWT(token, config.jwtSecret) : null;
  if (!user) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (path === "/config") {
    if (method === "GET") {
      const rawConfig = await getRawConfig(env);
      const { JWT_SECRET, ADMIN_PASSWORD, ...safeConfig } = rawConfig;
      return new Response(JSON.stringify(safeConfig), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "POST") {
      try {
        const newConfig = await request.json();
        const currentRawConfig = await getRawConfig(env);
        const updatedConfig = {
          ...currentRawConfig,
          ADMIN_USERNAME: newConfig.ADMIN_USERNAME || currentRawConfig.ADMIN_USERNAME,
          TG_BOT_TOKEN: newConfig.TG_BOT_TOKEN || "",
          TG_CHAT_ID: newConfig.TG_CHAT_ID || "",
          NOTIFYX_API_KEY: newConfig.NOTIFYX_API_KEY || "",
          WENOTIFY_URL: newConfig.WENOTIFY_URL || "",
          WENOTIFY_TOKEN: newConfig.WENOTIFY_TOKEN || "",
          WENOTIFY_USERID: newConfig.WENOTIFY_USERID || "",
          WENOTIFY_TEMPLATE_ID: newConfig.WENOTIFY_TEMPLATE_ID || "",
          WEBHOOK_URL: newConfig.WEBHOOK_URL || "",
          WEBHOOK_METHOD: newConfig.WEBHOOK_METHOD || "POST",
          WEBHOOK_HEADERS: newConfig.WEBHOOK_HEADERS || "",
          WEBHOOK_TEMPLATE: newConfig.WEBHOOK_TEMPLATE || "",
          SHOW_LUNAR: newConfig.SHOW_LUNAR === true,
          WECHATBOT_WEBHOOK: newConfig.WECHATBOT_WEBHOOK || "",
          WECHATBOT_MSG_TYPE: newConfig.WECHATBOT_MSG_TYPE || "text",
          WECHATBOT_AT_MOBILES: newConfig.WECHATBOT_AT_MOBILES || "",
          WECHATBOT_AT_ALL: newConfig.WECHATBOT_AT_ALL || "false",
          RESEND_API_KEY: newConfig.RESEND_API_KEY || "",
          EMAIL_FROM: newConfig.EMAIL_FROM || "",
          EMAIL_FROM_NAME: newConfig.EMAIL_FROM_NAME || "",
          EMAIL_TO: newConfig.EMAIL_TO || "",
          BARK_DEVICE_KEY: newConfig.BARK_DEVICE_KEY || "",
          BARK_SERVER: newConfig.BARK_SERVER || "https://api.day.app",
          BARK_IS_ARCHIVE: newConfig.BARK_IS_ARCHIVE || "false",
          ENABLED_NOTIFIERS: newConfig.ENABLED_NOTIFIERS || ["notifyx"],
          TIMEZONE: newConfig.TIMEZONE || currentRawConfig.TIMEZONE || "UTC"
        };
        if (newConfig.ADMIN_PASSWORD) {
          updatedConfig.ADMIN_PASSWORD = newConfig.ADMIN_PASSWORD;
        }
        if (!updatedConfig.JWT_SECRET || updatedConfig.JWT_SECRET === "your-secret-key") {
          updatedConfig.JWT_SECRET = generateRandomSecret();
        }
        await env.SUBSCRIPTIONS_KV.put("config", JSON.stringify(updatedConfig));
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 400 });
      }
    }
  }
  if (path === "/test-notification" && method === "POST") {
    try {
      const body = await request.json();
      let success = false;
      const tempConfig = { ...config };
      if (body.type === "telegram") {
        tempConfig.telegram = {
          botToken: body.TG_BOT_TOKEN || config.telegram?.botToken || "",
          chatId: body.TG_CHAT_ID || config.telegram?.chatId || ""
        };
        const content = "*\u6D4B\u8BD5\u901A\u77E5*\n\n\u8FD9\u662F\u4E00\u6761\u6D4B\u8BD5\u901A\u77E5...";
        success = await sendTelegramNotification(content, tempConfig);
      } else if (body.type === "notifyx") {
        tempConfig.notifyx = {
          apiKey: body.NOTIFYX_API_KEY || config.notifyx?.apiKey || ""
        };
        success = await sendNotifyXNotification("\u6D4B\u8BD5\u901A\u77E5", "## \u6D4B\u8BD5\u901A\u77E5...", "\u6D4B\u8BD5\u63CF\u8FF0", tempConfig);
      } else if (body.type === "wenotify") {
        tempConfig.wenotify = {
          url: body.WENOTIFY_URL || config.wenotify?.url || "",
          token: body.WENOTIFY_TOKEN || config.wenotify?.token || "",
          userid: body.WENOTIFY_USERID || config.wenotify?.userid || "",
          templateId: body.WENOTIFY_TEMPLATE_ID || config.wenotify?.templateId || ""
        };
        success = await sendWeNotifyEdgeNotification("\u6D4B\u8BD5\u901A\u77E5", "\u6D4B\u8BD5\u901A\u77E5...", tempConfig);
      } else if (body.type === "webhook") {
        tempConfig.webhook = {
          url: body.WEBHOOK_URL || config.webhook?.url || "",
          method: body.WEBHOOK_METHOD || config.webhook?.method || "POST",
          headers: body.WEBHOOK_HEADERS || config.webhook?.headers || "",
          template: body.WEBHOOK_TEMPLATE || config.webhook?.template || ""
        };
        success = await sendWebhookNotification("\u6D4B\u8BD5\u901A\u77E5", "\u6D4B\u8BD5\u901A\u77E5...", tempConfig);
      } else if (body.type === "wechatbot") {
        tempConfig.wechatBot = {
          webhook: body.WECHATBOT_WEBHOOK || config.wechatBot?.webhook || "",
          msgType: body.WECHATBOT_MSG_TYPE || config.wechatBot?.msgType || "text",
          atMobiles: body.WECHATBOT_AT_MOBILES || config.wechatBot?.atMobiles || "",
          atAll: body.WECHATBOT_AT_ALL || config.wechatBot?.atAll || "false"
        };
        success = await sendWechatBotNotification("\u6D4B\u8BD5\u901A\u77E5", "\u6D4B\u8BD5\u901A\u77E5...", tempConfig);
      } else if (body.type === "email") {
        tempConfig.email = {
          resendApiKey: body.RESEND_API_KEY || config.email?.resendApiKey || "",
          fromEmail: body.EMAIL_FROM || config.email?.fromEmail || "",
          toEmail: body.EMAIL_TO || config.email?.toEmail || ""
        };
        success = await sendEmailNotification("\u6D4B\u8BD5\u901A\u77E5", "\u6D4B\u8BD5\u901A\u77E5...", tempConfig);
      } else if (body.type === "bark") {
        tempConfig.bark = {
          server: body.BARK_SERVER || config.bark?.server || "",
          deviceKey: body.BARK_DEVICE_KEY || config.bark?.deviceKey || "",
          isArchive: body.BARK_IS_ARCHIVE || config.bark?.isArchive || "false"
        };
        success = await sendBarkNotification("\u6D4B\u8BD5\u901A\u77E5", "\u6D4B\u8BD5\u901A\u77E5...", tempConfig);
      }
      return new Response(JSON.stringify({ success, message: success ? "\u53D1\u9001\u6210\u529F" : "\u53D1\u9001\u5931\u8D25" }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
  }
  const subscriptionService = new SubscriptionService(env);
  if (path === "/subscriptions") {
    if (method === "GET") {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      return new Response(JSON.stringify(subscriptions), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "POST") {
      const sub = await request.json();
      const result = await subscriptionService.createSubscription(sub);
      return new Response(JSON.stringify(result), { status: result.success ? 201 : 400, headers: { "Content-Type": "application/json" } });
    }
  }
  if (path.startsWith("/subscriptions/")) {
    const parts = path.split("/");
    const id = parts[2];
    if (parts[3] === "toggle-status" && method === "POST") {
      const body = await request.json();
      const result = await subscriptionService.toggleSubscriptionStatus(id, body.isActive);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
    }
    if (parts[3] === "test-notify" && method === "POST") {
      try {
        const sub = await subscriptionService.getSubscription(id);
        if (!sub) return new Response(JSON.stringify({ success: false, message: "Subscription not found" }), { status: 404 });
        const now = /* @__PURE__ */ new Date();
        const expiry = new Date(sub.expiryDate);
        sub.daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        const content = formatNotificationContent([sub], config);
        await sendNotificationToAllChannels("\u8BA2\u9605\u63D0\u9192\u6D4B\u8BD5", content, config, "[\u624B\u52A8\u6D4B\u8BD5]");
        return new Response(JSON.stringify({ success: true, message: "\u5DF2\u53D1\u9001" }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500 });
      }
    }
    if (method === "GET") {
      const sub = await subscriptionService.getSubscription(id);
      return new Response(JSON.stringify(sub), { headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT") {
      const sub = await request.json();
      const result = await subscriptionService.updateSubscription(id, sub);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE") {
      const result = await subscriptionService.deleteSubscription(id);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
    }
  }
  return new Response(JSON.stringify({ success: false, message: "Not Found" }), { status: 404 });
}
__name(handleApiRequest, "handleApiRequest");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-qJCWc7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-qJCWc7/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
