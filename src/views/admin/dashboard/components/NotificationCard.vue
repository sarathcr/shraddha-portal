<script setup lang="ts">
import { Divider } from 'primevue'
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-4">
    <h2>Notification</h2>
    <ul class="flex flex-col gap-2">
      <li>
        <h3 class="text-black font-bold mb-4 uppercase text-[12px]">Today</h3>
        <ul class="flex flex-col gap-2.5">
          <li class="flex items-center gap-2.5">
            <div class="bg-[#FCE7F3] p-3 rounded-full size-[28px] flex items-center justify-center">
              <i class="pi pi-bell text-[#EC4899] text-[13px]"></i>
            </div>
            <p class="text-[14px]">
              Justin Thomas requested <span class="text-green-600 font-bold">200 Rs</span> for
              Glucose
            </p>
          </li>
          <li class="flex items-center gap-2.5">
            <div class="bg-[#DCFCE7] p-3 rounded-full size-[28px] flex items-center justify-center">
              <i class="pi pi-check text-[#22C55E] text-[13px]"></i>
            </div>
            <p class="text-[14px]">Request for Shuttlecocks approved.</p>
          </li>
        </ul>
      </li>
      <Divider />
      <li>
        <h3 class="text-black font-bold mb-4 uppercase text-[12px]">Yesterday</h3>
        <ul class="flex flex-col gap-2.5">
          <li class="flex items-center gap-2.5">
            <div class="bg-[#FCE7F3] p-3 rounded-full size-[28px] flex items-center justify-center">
              <i class="pi pi-bell text-[#EC4899] text-[13px]"></i>
            </div>
            <p class="text-[14px]">New member registration: Alex Doe</p>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
