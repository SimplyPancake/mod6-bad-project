<template>
	<!-- Camera view here -->
	<camera ref="customCam" autoplay></camera>
	<!-- Button to take a screenshot -->
	<el-button type="primary" @click="snapshot">Measure lol model</el-button>
	<el-select v-model="selectedCamIndex" class="m-2" placeholder="Select" size="large">
		<el-option v-for="item in options" :key="item" :label="item" :value="item" />
	</el-select>
	<el-button type="primary" @click="changeCamThing()">Switch camera</el-button>
</template>

<script setup>
import Camera from "simple-vue-camera";
import { ref } from "vue";
import { ElMessage } from 'element-plus'

// import * as cocoSSD from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

let customCam = ref(null);
let selectedCamIndex = ref(0);
let options = ref([0, 1, 2, 3, 4, 5]);
// let beerUrl = ref("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Beer_mug_transparent.png/600px-Beer_mug_transparent.png");

let model = null;
// cocoSSD.load().then(function (loadedModel) {
// 	model = loadedModel;
// 	ElMessage.success('Camera model loaded!');
// });

let changeCamThing = () => {
	const devices = customCam.value?.devices(["videoinput"]);
	const device = devices[selectedCamIndex.value];
	customCam.value?.changeCamera(device.deviceId);
};

const BlobToImageData = function (blob) {
	let blobUrl = URL.createObjectURL(blob);

	return new Promise((resolve, reject) => {
		let img = new Image();
		img.onload = () => resolve(img);
		img.onerror = err => reject(err);
		img.src = blobUrl;
	}).then(img => {
		URL.revokeObjectURL(blobUrl);
		// Limit to 256x256px while preserving aspect ratio
		let [w, h] = [img.width, img.height]
		let aspectRatio = w / h
		// Say the file is 1920x1080
		// divide max(w,h) by 256 to get factor
		let factor = Math.max(w, h) / 256
		w = w / factor
		h = h / factor

		// REMINDER
		// 256x256 = 65536 pixels with 4 channels (RGBA) = 262144 data points for each image
		// Data is encoded as Uint8ClampedArray with BYTES_PER_ELEMENT = 1
		// So each images = 262144bytes
		// 1000 images = 260Mb
		let canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		let ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		return ctx.getImageData(0, 0, w, h);    // some browsers synchronously decode image here
	})
}

function measureFoam() {

}

const snapshot = async () => {
	const blob = await customCam.value?.snapshot();
	const imgData = await BlobToImageData(blob);
	const predictions = await model.detect(
		imgData
	);
	ElMessage.success('Predictions: ' + predictions.length);
	ElMessage.success('According to prediction, the feedback is chosen:');

}

// cocoSsd.load().then(function (loadedModel) {
// 	model = loadedModel;
// 	console.log('Model loaded');
// });
</script>

<style scoped>

</style>