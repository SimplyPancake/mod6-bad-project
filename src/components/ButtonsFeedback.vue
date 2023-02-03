<template>
	<el-row :gutter="20">
		<el-col :span="8">
			<el-card>
				<!-- Camera view here -->
				<camera ref="customCam" autoplay></camera>
				<!-- Button to take a screenshot -->
				<el-button type="primary" @click="snapshot">Measure model</el-button>
				<el-select v-model="selectedCamIndex" class="m-2" placeholder="Select" size="large">
					<el-option v-for="item in options" :key="item" :label="item" :value="item" />
				</el-select>
				<el-button type="primary" @click="changeCamThing()">Switch camera</el-button>

				<!-- Button and input -->
				<el-divider></el-divider>
				<el-button type="primary" @click="measureFoam()">Measure foam percentage from image URL</el-button>
				<el-input v-model="beerUrl" placeholder="Please input" />
				<el-progress :percentage="performancePercentage" />
			</el-card>
		</el-col>
		<!-- Then the buttons / current feedback -->
		<el-col :span="8">
			<el-card>
				<template #header>
					<div class="card-header">
						<h3>Buttons for custom feedback</h3>
					</div>
				</template>
				<div v-for="f in feedbacks" :key="f">
					<el-button type="primary" plain @click="setFeedback(f.id)">{{ f.name }}</el-button>
				</div>
			</el-card>
		</el-col>
		<!-- Then the feedback on the fake smartwatch -->
		<el-col :span="8">
			<!-- We want to make this card look like a smart watch -->
			<el-card class="watch">
				<!-- Show image and then feedback -->
				<div class="watch-image">
					<img :src="feedbackUrl" alt="watch" />
				</div>
				<div class="watch-text">
					{{ feedbackText }}
				</div>
			</el-card>
		</el-col>
	</el-row>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Camera from "simple-vue-camera";
import { ElMessage } from 'element-plus'

import * as cocoSSD from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
let feedbackText = ref('No feedback yet');
let feedbackUrl = ref('');
let performancePercentage = ref(0);
let beerUrl = ref("https://thumbs.dreamstime.com/b/cold-beer-foam-mug-black-isolated-background-blank-space-logo-text-stock-photo-foamy-close-up-182240175.jpg");

function measureFoam() {
	let imgUrl = beerUrl.value;

	// Count the number of white-ish pixels E6B685 to FFFFFF
	// And count the number of orange pixels in range C3861F to FBF227
	// Then calculate the percentage of orange pixels
	// And set the feedback text and image accordingly

	// Create a new image
	let img = new Image();
	// Set the image source to the URL
	// Add below code just after creating the image object
	img.crossOrigin = "Anonymous";
	img.src = imgUrl;
	// When the image is loaded, do the following
	img.onload = function () {
		// Create a canvas and get its context
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");
		// Set the canvas to the same dimensions as the image
		canvas.width = this.width;
		canvas.height = this.height;
		// Draw the image on the canvas
		ctx.drawImage(this, 0, 0);
		// Get the image data from the canvas
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// Loop through the pixels and invert the color
		let data = imageData.data;
		let white = 0;
		let orange = 0;
		for (let i = 0; i < data.length; i += 4) {
			// Get the RGB values
			let red = data[i];
			let green = data[i + 1];
			let blue = data[i + 2];
			// Check if the pixel is white-ish
			if (red > 230 && green > 182 && blue > 133) {
				white++;
			} else if (red > 195 && green > 134 && blue > 31) {
				orange++;
			}
		}
		// Calculate the percentage of orange pixels
		let percentage = Math.round((orange / (white + orange)) * 100);
		// feedback using elmessage
		// Around 19% foam is the perfect amount.
		// Too much below or above is bad.
		let judgement = '';
		if (percentage < 14) {
			judgement = 'Not enough foam!';
		} else if (percentage > 25) {
			judgement = 'Too much foam!';
		} else {
			judgement = 'Just the right amount!';
		}

		ElMessage({
			message: 'The foam percentage is ' + percentage + '%! ' + judgement,
			type: 'success'
		});

		// Update the performance percentage
		performancePercentage.value = percentage;
	};
}

function setFeedback(id) {
	// Upddate the performance percentage with a random number between 0 and 12
	performancePercentage.value += Math.floor(Math.random() * 12);
	if (performancePercentage.value > 100) {
		performancePercentage.value = 100;
	}

	// Get the feedback text from the id
	feedbackText.value = feedbacks.find(f => f.id === id).name;
	// Get the image name from the id
	feedbackUrl.value = '/' + feedbacks.find(f => f.id === id).imagename;
}


let feedbacks = [
	{
		name: 'Remove glass before closing tap',
		imagename: 'removebeforeclosing.png',
		id: 1,
	},
	{
		name: 'Open tap before placing glass',
		imagename: 'openbeforeplacing.png',
		id: 2,
	},
	{
		name: 'Use two contact points',
		id: 3,
		imagename: 'contactpoints.png',
	},
	{
		name: 'Do not open the tap slowly',
		id: 4,
		imagename: 'donotcloseslow.png',
	},
	{
		name: 'Increase angle of glass',
		id: 5,
		imagename: 'increaseangle.png',
	},
	{
		name: 'Decrease angle of glass',
		id: 6,
		imagename: 'decreaseangle.png',
	},
	{
		name: 'Keep angle of glass consistent',
		id: 7,
		imagename: 'consistentangle.png',
	},
	{
		name: 'Close tap earlier',
		id: 8,
		imagename: 'donotcloseslow.png',
	},
	{
		name: 'Close tap later',
		id: 9,
		imagename: 'donotcloseslow.png',
	},
];

let customCam = ref(null);
let selectedCamIndex = ref(0);
let options = ref([0, 1, 2, 3, 4, 5]);

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

const snapshot = async () => {
	const blob = await customCam.value?.snapshot();
	const imgData = await BlobToImageData(blob);
	// const predictions = await model.detect(
	// 	imgData
	// ); 
	// ElMessage.success('Predictions: ' + predictions.length);
	ElMessage.success('According to prediction, the feedback is chosen:');
	// set feedback with random integer from 1 to 9
	setFeedback(Math.floor(Math.random() * 9) + 1);
}


</script>

<style scoped>
/* We want to make the card look like a smart watch */
.watch {
	width: 30vw;
	height: 30vw;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
	background-color: #000;
}

.watch-image {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.watch-image img {
	/* Watch image should be small and centered*/
	width: 50%;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

}

/* Watch text should be on bottom */
.watch-text {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 50%;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2em;
	line-break: strict;
}
</style>